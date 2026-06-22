export type TlvField = {
  id: string;
  value: string;
};

export type TlvParseFailure = {
  ok: false;
  message: string;
};

export type TlvParseSuccess = {
  ok: true;
  fields: TlvField[];
};

export type TlvParseResult = TlvParseSuccess | TlvParseFailure;

function tlvFailure(message: string): TlvParseFailure {
  return { ok: false, message };
}

export function parseTlvSequence(data: string): TlvParseResult {
  const fields: TlvField[] = [];
  let offset = 0;

  while (offset < data.length) {
    if (data.length - offset < 4) {
      return tlvFailure('TLV sequence is incomplete');
    }

    const id = data.slice(offset, offset + 2);
    const lengthRaw = data.slice(offset + 2, offset + 4);
    const length = Number.parseInt(lengthRaw, 10);

    if (!/^\d{2}$/.test(lengthRaw) || Number.isNaN(length)) {
      return tlvFailure(`TLV length is not numeric for id ${id}`);
    }

    offset += 4;

    if (data.length - offset < length) {
      return tlvFailure(`TLV value for id ${id} exceeds payload length`);
    }

    const value = data.slice(offset, offset + length);
    offset += length;
    fields.push({ id, value });
  }

  return { ok: true, fields };
}

export function findTlvField(fields: TlvField[], id: string): string | undefined {
  return fields.find((field) => field.id === id)?.value;
}

export function findPixMerchantAccount(
  fields: TlvField[],
): { value: string; nestedFields: TlvField[] } | undefined {
  for (const field of fields) {
    if (field.id !== '26') {
      continue;
    }
    const nested = parseTlvSequence(field.value);
    if (!nested.ok) {
      continue;
    }
    const gui = findTlvField(nested.fields, '00');
    if (gui?.toLowerCase() === 'br.gov.bcb.pix') {
      return { value: field.value, nestedFields: nested.fields };
    }
  }
  return undefined;
}
