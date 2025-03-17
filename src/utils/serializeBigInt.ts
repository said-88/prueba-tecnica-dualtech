// Función para convertir BigInt a string en objetos
export const serializeBigInt = (data: any): any => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}
