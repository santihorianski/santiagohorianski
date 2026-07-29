export const PARTIES = {
  'La Libertad Avanza': { name: 'La Libertad Avanza', color: '#9b59b6', text: '#fff' }, // Violeta
  'Unión Cívica Radical': { name: 'Unión Cívica Radical', color: '#e74c3c', text: '#fff' }, // Rojo (y blanco)
  'Encuentro Misionero': { name: 'Encuentro Misionero', color: '#27ae60', text: '#fff' }, // Verde y Rojo (usaremos un verde oscuro primario)
  'Hacemos': { name: 'Hacemos', color: '#a8e6cf', text: '#000' }, // Verde clarito
  'La Vida y los Valores': { name: 'La Vida y los Valores', color: '#8b4513', text: '#fff' }, // Marrón
  'Desconocido': { name: 'Desconocido', color: '#ccc', text: '#000' }
};

export const COUNCILLORS = {
  'Fernando Zarza': { party: 'Hacemos' },
  'Luciana Scromeda': { party: 'Encuentro Misionero' },
  'Malena Mazal': { party: 'Encuentro Misionero', prefix: 'Lic.' },
  'Laura Traid': { party: 'Encuentro Misionero', prefix: 'Prof.' },
  'Santiago Horianski': { party: 'La Libertad Avanza' },
  'Héctor Cardozo': { party: 'Encuentro Misionero', prefix: 'Ing.' },
  'Samira Almirón': { party: 'Encuentro Misionero', prefix: 'Ing.' },
  'Judith Salom': { party: 'Unión Cívica Radical', prefix: 'Prof.' },
  'Ángel Martínez': { party: 'La Vida y los Valores' }, // Ángel Mario Martínez
  'Pablo Argañaraz': { party: 'La Libertad Avanza', prefix: 'Vet.' },
  'Jair Dib': { party: 'Encuentro Misionero', prefix: 'Abg.' },
  'Valeria Gómez de Oliveira': { party: 'La Libertad Avanza', prefix: 'Abg.' }
};

export const COMMISSIONS = {
  'Hacienda y Presupuesto': {
    president: 'Luciana Scromeda',
    vicepresident: 'María Elena Fernández',
    vocales: ['Samira Almirón', 'Héctor Cardozo', 'Laura Traid', 'Fernando Zarza', 'Judith Salom']
  },
  'Transporte y Tránsito': {
    president: 'Santiago Horianski',
    vicepresident: 'Fernando Zarza',
    vocales: ['Laura Traid', 'Luciana Scromeda', 'Héctor Cardozo', 'Ángel Martínez', 'María Elena Fernández']
  },
  'Obras Públicas y Urbanismo': {
    president: 'Héctor Cardozo',
    vicepresident: 'Ángel Martínez',
    vocales: ['Jair Dib', 'Luciana Scromeda', 'Pablo Argañaraz', 'Judith Salom', 'Valeria Gómez de Oliveira']
  },
  'Salud Pública y Discapacidad': {
    president: 'Judith Salom',
    vicepresident: 'Malena Mazal',
    vocales: ['Laura Traid', 'Héctor Cardozo', 'Pablo Argañaraz', 'Ángel Martínez', 'Santiago Horianski']
  },
  'Ambiente y Desarrollo Sustentable': {
    president: 'Fernando Zarza',
    vicepresident: 'Judith Salom',
    vocales: ['Héctor Cardozo', 'Samira Almirón', 'Laura Traid', 'María Elena Fernández', 'Ángel Martínez']
  },
  'Asuntos Sociales y Desarrollo Vecinal': {
    president: 'Laura Traid',
    vicepresident: 'Judith Salom',
    vocales: ['Malena Mazal', 'Jair Dib', 'Héctor Cardozo', 'Valeria Gómez de Oliveira', 'Pablo Argañaraz']
  },
  'Cultura, Educación y Deporte': {
    president: 'Malena Mazal',
    vicepresident: 'Pablo Argañaraz',
    vocales: ['Samira Almirón', 'Luciana Scromeda', 'Héctor Cardozo', 'María Elena Fernández', 'Judith Salom']
  },
  'Legislacion General, Régimen del Empleado Municipal y Enjuiciamiento': {
    president: 'Valeria Gómez de Oliveira',
    vicepresident: 'Luciana Scromeda',
    vocales: ['Jair Dib', 'Samira Almirón', 'Malena Mazal', 'Pablo Argañaraz', 'María Elena Fernández']
  },
  'Mercosur e Integración Regional': {
    president: 'María Elena Fernández',
    vicepresident: 'Fernando Zarza',
    vocales: ['Samira Almirón', 'Laura Traid', 'Valeria Gómez de Oliveira', 'Judith Salom', 'Santiago Horianski']
  },
  'Inclusión y Equidad de Género': {
    president: 'Judith Salom',
    vicepresident: 'Malena Mazal',
    vocales: ['Laura Traid', 'Héctor Cardozo', 'Pablo Argañaraz', 'Ángel Martínez', 'Santiago Horianski']
  },
  'Turismo': {
    president: 'Ángel Martínez',
    vicepresident: 'Fernando Zarza',
    vocales: ['Samira Almirón', 'Laura Traid', 'Valeria Gómez de Oliveira', 'Judith Salom', 'Santiago Horianski']
  },
  'Innovación, Ciencia y Tecnológica': {
    president: 'Samira Almirón',
    vicepresident: 'Santiago Horianski',
    vocales: ['Malena Mazal', 'Laura Traid', 'Héctor Cardozo', 'Valeria Gómez de Oliveira', 'Fernando Zarza']
  }
};
