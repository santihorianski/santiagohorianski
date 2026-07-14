import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';

export const generateLegislativeProject = async (report) => {
  // Configuración de textos automáticos según categoría
  let actionText = '';
  let reasonText = '';

  const catLower = report.category.toLowerCase();
  
  if (catLower.includes('calles') || catLower.includes('asfalto') || catLower.includes('baches')) {
    actionText = `proceda a realizar de manera urgente las obras de bacheo, reparación y reacondicionamiento asfáltico en la vía pública ubicada en ${report.location}`;
    reasonText = `El presente proyecto de Comunicación encuentra su fundamento en la imperiosa necesidad de brindar una respuesta concreta y efectiva a los reiterados reclamos manifestados por los vecinos de la zona. El avanzado estado de deterioro y la presencia de baches en la mencionada arteria representan un peligro inminente para la seguridad vial, ocasionando continuos daños en el parque automotor e incrementando significativamente el riesgo de siniestros de tránsito. Resulta deber ineludible del Estado Municipal garantizar la óptima transitabilidad y seguridad en el espacio público.`;
  } else if (catLower.includes('iluminación') || catLower.includes('luz')) {
    actionText = `proceda a la urgente reparación, mantenimiento y/o recambio de las luminarias pertenecientes al sistema de alumbrado público en la zona de ${report.location}`;
    reasonText = `El presente proyecto se fundamenta en la necesidad de restituir el servicio de alumbrado público en el sector afectado. Entendemos que una correcta y eficiente iluminación de los espacios públicos constituye una herramienta fundamental e indispensable para la prevención del delito, brindando mayor seguridad ciudadana. La falta de luz sume a la cuadra en una preocupante oscuridad que vulnera la tranquilidad y el bienestar de las familias que allí residen.`;
  } else if (catLower.includes('verdes') || catLower.includes('maleza')) {
    actionText = `proceda a llevar a cabo tareas intensivas de desmalezamiento, limpieza y mantenimiento integral de los espacios públicos y/o baldíos ubicados en ${report.location}`;
    reasonText = `El presente proyecto tiene como objeto principal atender la descontrolada proliferación de malezas en la zona. Esta situación no solo genera un impacto visual negativo y un evidente abandono del entorno urbano, sino que fundamentalmente propicia la aparición de alimañas y la reproducción de mosquitos vectores de enfermedades vectoriales como el Dengue. Es obligación indelegable del Municipio velar por la salubridad y la higiene pública.`;
  } else if (catLower.includes('limpieza') || catLower.includes('residuos') || catLower.includes('basura')) {
    actionText = `proceda a ejecutar tareas de limpieza profunda y la consecuente erradicación de minibasurales o focos de contaminación en la vía pública ubicada en ${report.location}`;
    reasonText = `El presente proyecto busca salvaguardar la salubridad e higiene urbana del barrio. La preocupante acumulación de residuos en la vía pública genera focos infecciosos, olores nauseabundos y una grave contaminación ambiental que perjudica la calidad de vida de los habitantes. La rápida intervención municipal resulta vital para evitar que la zona se convierta en un basural a cielo abierto crónico.`;
  } else if (catLower.includes('tránsito') || catLower.includes('transito') || catLower.includes('semáforo')) {
    actionText = `proceda a la urgente reparación, mantenimiento y/o instalación de dispositivos de ordenamiento del tránsito y señalización vial correspondiente en la intersección/zona de ${report.location}`;
    reasonText = `El presente proyecto persigue salvaguardar la integridad física de peatones y conductores ante el inminente peligro de accidentes que genera el desordenamiento vehicular en el área citada. La correcta señalización y el pleno funcionamiento de semáforos u otros dispositivos de control resultan vitales para garantizar un flujo de tránsito seguro y previsible, siendo responsabilidad ineludible del Estado ordenar la circulación urbana.`;
  } else if (catLower.includes('seguridad') || catLower.includes('polic')) {
    actionText = `interceda y articule acciones ante el Ministerio de Gobierno y la Policía de la Provincia a los fines de solicitar el inmediato refuerzo de patrullajes preventivos y mayor presencia policial en la zona de ${report.location}`;
    reasonText = `Esta iniciativa legislativa se motiva en la honda preocupación manifestada por los vecinos ante reiterados hechos de inseguridad en la zona que vulneran su integridad y sus bienes. Resulta estrictamente prioritario que el Estado Municipal articule esfuerzos institucionales tendientes a la prevención del delito, brindando la contención y protección ciudadana que los habitantes merecen para desarrollar sus vidas en un marco de paz social.`;
  } else if (catLower.includes('peligro') || catLower.includes('caída') || catLower.includes('poste') || catLower.includes('árbol')) {
    actionText = `proceda a comisionar de forma urgente una cuadrilla técnica para realizar las tareas de remoción, reparación o aseguramiento de estructuras o especies arbóreas con riesgo inminente de caída en la vía pública ubicada en ${report.location}`;
    reasonText = `El presente pedido de informe y acción reviste carácter de suma urgencia, toda vez que existe un riesgo palpable e inminente de derrumbe o caída que podría ocasionar una verdadera tragedia, afectando gravemente la vida de los transeúntes y causando severos daños materiales a la propiedad pública y privada. El Municipio debe actuar con absoluta celeridad y diligencia para neutralizar cualquier amenaza en el espacio público.`;
  } else {
    // Genérico
    actionText = `proceda a intervenir de forma prioritaria y solucionar la problemática vinculada a ${report.category} en la ubicación de ${report.location}`;
    reasonText = `El presente proyecto de Comunicación halla sus motivos en las legítimas demandas y reclamos formalizados por los vecinos de la zona, quienes se ven directamente afectados en su cotidianeidad por esta problemática. Siendo que es deber irrenunciable del Estado Municipal intervenir proactivamente para velar por la seguridad, salubridad y el bienestar general de la comunidad, se solicita el pronto diligenciamiento de este pedido.`;
  }

  // Si el vecino dejó una descripción manual, la agregamos a los fundamentos
  const userDescriptionParagraph = report.description && report.description !== `Pedido de inspección y resolución inmediata para el problema de ${report.category.toLowerCase()}.` 
    ? [
        new Paragraph({
          children: [
            new TextRun({
              text: `En palabras de los vecinos afectados: `,
              italics: true,
            }),
            new TextRun({
              text: `"${report.description}"`,
              italics: true,
              color: "FF0000", // ROJO para fácil identificación
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200, line: 360 }, // line: 360 = 1.5 spacing
        })
      ]
    : [];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 22, // 11pt
          },
        },
      },
    },
    sections: [{
      properties: {},
      children: [
        // REFERENCIA DE SEGUIMIENTO AL INICIO
        new Paragraph({
          children: [
            new TextRun({
              text: `Ref: Reclamo Ciudadano N° ${report.trackingCode || report.id}`,
              italics: true,
              size: 20, // 10pt
            })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 400 },
        }),
        // ENCABEZADO
        new Paragraph({
          children: [
            new TextRun({
              text: "PROYECTO DE COMUNICACIÓN",
              bold: true,
              underline: {},
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "EL HONORABLE CONCEJO DELIBERANTE DE LA CIUDAD DE POSADAS",
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "COMUNICA",
              bold: true,
              underline: {},
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // ARTICULO 1
        new Paragraph({
          children: [
            new TextRun({
              text: "ARTÍCULO 1º.- QUE VERIA CON AGRADO ",
              bold: true,
              underline: {},
            }),
            new TextRun({
              text: "que el Departamento Ejecutivo Municipal, a través de la Secretaría que corresponda, ",
            }),
            new TextRun({
              text: actionText,
              color: "FF0000", // ROJO
            }),
            new TextRun({
              text: " a los fines de garantizar el bienestar de la comunidad.",
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 400, line: 360 },
        }),

        // ARTICULO 2
        new Paragraph({
          children: [
            new TextRun({
              text: "ARTÍCULO 2º.- DE FORMA.-",
              bold: true,
              underline: {},
            }),
          ],
          spacing: { after: 800 },
        }),

        // FUNDAMENTOS TÍTULO
        new Paragraph({
          children: [
            new TextRun({
              text: "FUNDAMENTOS",
              bold: true,
              underline: {},
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // PÁRRAFO FUNDAMENTOS 1
        new Paragraph({
          children: [
            new TextRun({
              text: reasonText,
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200, line: 360 },
        }),

        // PÁRRAFO DESCRIPCIÓN DEL VECINO
        ...userDescriptionParagraph,

        // PÁRRAFO FINAL (CIERRE)
        new Paragraph({
          children: [
            new TextRun({
              text: "Por estas razones y otras consideraciones que aportaré oportunamente, solicito a mis pares el acompañamiento para la aprobación del presente Proyecto de Comunicación.-",
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 400, line: 360 },
        }),
      ],
    }],
  });

  // Generar y descargar el archivo
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Proyecto_Comunicacion_${report.trackingCode || 'Vecinal'}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
