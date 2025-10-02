const dayjs = require('dayjs');

function soles(n) {
  const v = Number(n || 0);
  return v.toLocaleString('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });
}

exports.buildQuoteDoc = (payload) => {
  const {
    company = {},
    quoteNumber,
    createdAt,
    pedido = {},
    cliente = {},
    evento = {},
    items = [],
    observaciones = ''
  } = payload;

  const total = items.reduce((acc, it) => acc + Number(it.precio || 0) * Number(it.cantidad || 0), 0);

  // Cabecera
  const headerTable = {
    columns: [
      company.logoBase64
        ? { image: company.logoBase64, width: 110 }
        : { text: company.name || 'D’ La Cruz Video y Fotografía', bold: true, fontSize: 16 },
      {
        width: '*',
        alignment: 'right',
        stack: [
          { text: 'COTIZACIÓN', bold: true, fontSize: 16, margin: [0, 0, 0, 6] },
          { text: `N°: ${quoteNumber || '-'}` },
          { text: `Fecha: ${dayjs(createdAt || new Date()).format('DD/MM/YYYY HH:mm')}` }
        ]
      }
    ],
    margin: [0, 0, 0, 10]
  };

  // Datos del pedido / cliente
  const info = {
    table: {
      widths: ['*', '*'],
      body: [
        [
          {
            stack: [
              { text: 'Datos del pedido', bold: true, margin: [0, 0, 0, 4] },
              { text: `Pedido: ${pedido.nombre || '-'}` },
              { text: `Empleado: ${pedido.empleado || '-'}` },
              { text: `Fecha de registro: ${pedido.fechaRegistro || '-'}` },
            ],
          },
          {
            stack: [
              { text: 'Datos del cliente', bold: true, margin: [0, 0, 0, 4] },
              { text: `Documento: ${cliente.documento || '-'}` },
              { text: `Nombres: ${cliente.nombres || '-'}` },
              { text: `Apellidos: ${cliente.apellidos || '-'}` },
            ],
          },
        ]
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 10]
  };

  const eventoTbl = {
    table: {
      widths: ['auto', 'auto', 'auto', '*', 'auto'],
      body: [
        [
          { text: '#', bold: true },
          { text: 'Fecha', bold: true },
          { text: 'Hora', bold: true },
          { text: 'Dirección exacta', bold: true },
          { text: 'Notas', bold: true }
        ],
        [
          evento.numero ?? 1,
          evento.fecha || '-',
          evento.hora || '-',
          evento.direccionExacta || '-',
          evento.notas || '-'
        ]
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 10]
  };

  const itemsTbl = {
    table: {
      widths: ['*', 'auto', 'auto', 'auto'],
      body: [
        [
          { text: 'Descripción', bold: true },
          { text: 'Precio', bold: true, alignment: 'right' },
          { text: 'Cant.', bold: true, alignment: 'right' },
          { text: 'Subtotal', bold: true, alignment: 'right' }
        ],
        ...items.map(it => ([
          it.descripcion || '-',
          { text: soles(it.precio), alignment: 'right' },
          { text: String(it.cantidad || 0), alignment: 'right' },
          { text: soles(Number(it.precio || 0) * Number(it.cantidad || 0)), alignment: 'right' }
        ])),
        [
          { text: 'TOTAL', colSpan: 3, alignment: 'right', bold: true }, {}, {},
          { text: soles(total), alignment: 'right', bold: true }
        ]
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 10]
  };

  const obs = {
    stack: [
      { text: 'Observaciones', bold: true, margin: [0,0,0,4] },
      { text: observaciones || '—' }
    ],
    margin: [0, 0, 0, 16]
  };

  const footer = (currentPage, pageCount) => ({
    margin: [40, 10, 40, 0],
    columns: [
      { text: company.footerText || 'Gracias por su preferencia.', opacity: 0.7 },
      { text: `${currentPage} / ${pageCount}`, alignment: 'right', opacity: 0.7 }
    ]
  });

  return {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 50],
    footer,
    content: [headerTable, info, eventoTbl, itemsTbl, obs]
  };
};
