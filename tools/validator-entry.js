import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

// The fetched schema, rather than a separately maintained copy, is authoritative.
export function createValidator(schema) {
  const ajv = new Ajv2020({allErrors:true, strict:true, strictRequired:false, strictTypes:false});
  addFormats(ajv);
  const validate = ajv.compile(schema);
  return data => {
    if (!validate(data)) throw new Error('Ogiltigt platsregister: '+ajv.errorsText(validate.errors));
    const ids = new Set();
    for (const place of data.places) {
      if (ids.has(place.id)) throw new Error('Dubblett av plats-id: '+place.id);
      ids.add(place.id);
    }
    return data;
  };
}
