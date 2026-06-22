import { validatePixKey } from '../pix/index.js';
import type { PixKey, PixKeyType, ValidationErrorCode } from '../../types/validation-result.js';
import { BRCODE_COUNTRY_CODE, BRCODE_CRC_LENGTH, BRCODE_CRC_TAG, BRCODE_PAYLOAD_FORMAT_INDICATOR } from './constants.js';
import { verifyBrCodeCrc } from './crc16.js';
import { findPixMerchantAccount, findTlvField, parseTlvSequence, type TlvField } from './tlv.js';

export type BrCodeParsedFields = {
  merchantName: string;
  merchantCity: string;
  amount?: string;
  txid?: string;
  pixKey?: PixKey;
  pixKeyType?: PixKeyType;
  pixInitiationUrl?: string;
};

export type BrCodeParseFailure = {
  ok: false;
  code: ValidationErrorCode;
  message: string;
};

export type BrCodeParseSuccess = {
  ok: true;
  payload: string;
  fields: BrCodeParsedFields;
};

export type BrCodeParseResult = BrCodeParseSuccess | BrCodeParseFailure;

function failure(
  code: BrCodeParseFailure['code'],
  message: string,
): BrCodeParseFailure {
  return { ok: false, code, message };
}

export function normalizeBrCodePayload(input: string): string {
  return input.trim();
}

function extractPixAccount(
  nestedFields: TlvField[],
): { ok: true; pixKey?: string; pixInitiationUrl?: string } | BrCodeParseFailure {
  const pixKey = findTlvField(nestedFields, '01');
  const pixInitiationUrl = findTlvField(nestedFields, '25');

  if (!pixKey && !pixInitiationUrl) {
    return failure('UNSUPPORTED_FORMAT', 'PIX merchant account must include key (01) or initiation URL (25)');
  }

  return { ok: true, pixKey, pixInitiationUrl };
}

function extractTxid(tag62: string | undefined): string | undefined {
  if (!tag62) {
    return undefined;
  }
  const nested = parseTlvSequence(tag62);
  if (!nested.ok) {
    return undefined;
  }
  return findTlvField(nested.fields, '05');
}

function parseFields(rootFields: TlvField[]): BrCodeParseSuccess | BrCodeParseFailure {
  const formatIndicator = findTlvField(rootFields, '00');
  if (formatIndicator !== BRCODE_PAYLOAD_FORMAT_INDICATOR) {
    return failure(
      'UNSUPPORTED_FORMAT',
      `BR Code payload format indicator must be ${BRCODE_PAYLOAD_FORMAT_INDICATOR}`,
    );
  }

  const merchantAccount = findPixMerchantAccount(rootFields);
  if (!merchantAccount) {
    return failure('UNSUPPORTED_FORMAT', 'BR Code payload must include PIX merchant account (tag 26)');
  }

  const pixAccount = extractPixAccount(merchantAccount.nestedFields);
  if (!pixAccount.ok) {
    return pixAccount;
  }

  const countryCode = findTlvField(rootFields, '58');
  if (countryCode !== BRCODE_COUNTRY_CODE) {
    return failure('UNSUPPORTED_FORMAT', `BR Code country code must be ${BRCODE_COUNTRY_CODE}`);
  }

  const merchantName = findTlvField(rootFields, '59');
  const merchantCity = findTlvField(rootFields, '60');
  if (!merchantName || !merchantCity) {
    return failure('UNSUPPORTED_FORMAT', 'BR Code payload must include merchant name (59) and city (60)');
  }

  const amount = findTlvField(rootFields, '54');
  const txid = extractTxid(findTlvField(rootFields, '62'));

  let pixKeyType: PixKeyType | undefined;
  let pixKey: PixKey | undefined;

  if (pixAccount.pixKey) {
    const keyResult = validatePixKey(pixAccount.pixKey);
    if (!keyResult.ok) {
      return failure(keyResult.code, keyResult.message);
    }
    pixKey = keyResult.value;
    pixKeyType = keyResult.keyType;
  }

  return {
    ok: true,
    payload: '',
    fields: {
      merchantName,
      merchantCity,
      ...(amount ? { amount } : {}),
      ...(txid ? { txid } : {}),
      ...(pixKey ? { pixKey, pixKeyType } : {}),
      ...(pixAccount.pixInitiationUrl ? { pixInitiationUrl: pixAccount.pixInitiationUrl } : {}),
    },
  };
}

export function parseBrCodePayload(input: string): BrCodeParseResult {
  const normalized = normalizeBrCodePayload(input);

  if (normalized.length === 0) {
    return failure('EMPTY_INPUT', 'BR Code payload is empty');
  }

  if (!/^[\x20-\x7E]+$/.test(normalized)) {
    return failure('INVALID_CHARACTER', 'BR Code payload contains invalid characters');
  }

  const crc = verifyBrCodeCrc(normalized);
  if (!crc.ok) {
    return failure('INVALID_CHECK_DIGIT', crc.message);
  }

  const withoutCrc = normalized.slice(0, -BRCODE_CRC_LENGTH);
  const crcTagHeader = `${BRCODE_CRC_TAG}${String(BRCODE_CRC_LENGTH).padStart(2, '0')}`;
  const tlv = parseTlvSequence(withoutCrc.slice(0, -crcTagHeader.length));
  if (!tlv.ok) {
    return failure('UNSUPPORTED_FORMAT', tlv.message);
  }

  const parsed = parseFields(tlv.fields);
  if (!parsed.ok) {
    return parsed;
  }

  return {
    ok: true,
    payload: normalized,
    fields: parsed.fields,
  };
}
