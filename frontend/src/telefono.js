// Enlace tel: a partir del teléfono tal como lo guarda el contrato (texto libre). null si no hay dígitos suficientes.
export function enlaceTelefono(telefono) {
  const limpio = (telefono ?? '').replace(/(?!^\+)[^\d]/g, '');
  return /\d{7,}/.test(limpio) ? `tel:${limpio}` : null;
}
