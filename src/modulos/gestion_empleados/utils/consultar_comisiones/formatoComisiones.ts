export const monedaComision = (n: number) => `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fechaComision = (f: string) => f.slice(0, 10).split('-').reverse().join('/');
