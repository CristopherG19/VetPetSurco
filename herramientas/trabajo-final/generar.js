const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  Header, Footer, PageNumber, LevelFormat, VerticalAlign,
  PositionalTab, PositionalTabAlignment, PositionalTabLeader, ImageRun,
} = require('docx');

const ROOT = path.resolve(__dirname, '../..');
const SALIDA = process.argv[2] || path.join(ROOT, 'docs/originales/TrabajoFinal_VetPetConnect.docx');

const PRIM = '14594F';
const ACC  = '2E8B74';
const SOFT = 'E9F1EF';
const GRIS = '5A6670';
const ANCHO = 9638;

const P = (texto, o = {}) => new Paragraph({
  alignment: o.align ?? AlignmentType.JUSTIFIED,
  spacing: { after: o.after ?? 140, line: 276 },
  keepNext: o.keepNext ?? false,
  indent: o.indent,
  children: [new TextRun({
    text: texto,
    bold: o.bold ?? false,
    italics: o.italics ?? false,
    size: o.size ?? 21,
    color: o.color ?? '20262B',
    font: o.font,
  })],
});

const H = (texto, nivel, salto = false) => new Paragraph({
  text: texto,
  heading: nivel,
  keepNext: true,
  pageBreakBefore: salto || nivel === HeadingLevel.HEADING_1,
});

const vinetas = (items) => items.map((t) => new Paragraph({
  numbering: { reference: 'puntos', level: 0 },
  alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 90, line: 276 },
  children: [new TextRun({ text: t, size: 21, color: '20262B' })],
}));

const aire = (n = 160) => new Paragraph({ spacing: { after: n }, children: [] });

const borde = { style: BorderStyle.SINGLE, size: 4, color: 'C9D6D2' };
const BORDES = {
  top: borde, bottom: borde, left: borde, right: borde,
  insideHorizontal: borde, insideVertical: borde,
};

function celda(texto, o = {}) {
  const parrafos = (Array.isArray(texto) ? texto : [texto]).map((t) => new Paragraph({
    alignment: o.align ?? AlignmentType.LEFT,
    spacing: { before: 40, after: 40, line: 264 },
    children: [new TextRun({
      text: t,
      bold: o.bold ?? false,
      italics: o.italics ?? false,
      size: o.size ?? 19,
      color: o.color ?? '20262B',
    })],
  }));
  return new TableCell({
    children: parrafos,
    width: { size: o.ancho, type: WidthType.DXA },
    shading: o.fondo ? { type: ShadingType.CLEAR, fill: o.fondo, color: 'auto' } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
  });
}

function tabla(cabeceras, filas, anchos, o = {}) {
  const cabecera = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: cabeceras.map((t, i) => new TableCell({
      children: [new Paragraph({
        spacing: { before: 50, after: 50 },
        children: [new TextRun({ text: t, bold: true, size: 19, color: 'FFFFFF' })],
      })],
      width: { size: anchos[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: PRIM, color: 'auto' },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 70, bottom: 70, left: 110, right: 110 },
    })),
  });

  const cuerpo = filas.map((fila, n) => new TableRow({
    cantSplit: true,
    children: fila.map((t, i) => celda(t, {
      ancho: anchos[i],
      fondo: n % 2 === 1 ? 'F5F8F7' : undefined,
      bold: o.primeraNegrita && i === 0,
    })),
  }));

  return new Table({
    columnWidths: anchos,
    width: { size: anchos.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    borders: BORDES,
    rows: [cabecera, ...cuerpo],
  });
}

function figura(rutaRelativa, leyenda, anchoPx = 520, altoPx = 310) {
  const rutaAbs = path.join(ROOT, rutaRelativa);
  if (!fs.existsSync(rutaAbs)) {
    return [P(`[Imagen no encontrada: ${rutaRelativa}]`, { italics: true, color: GRIS })];
  }
  const ext = path.extname(rutaAbs).toLowerCase().replace('.', '');
  const tipo = ext === 'jpg' ? 'jpg' : 'png';
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 140, after: 60 },
      keepNext: true,
      children: [
        new ImageRun({
          data: fs.readFileSync(rutaAbs),
          transformation: { width: anchoPx, height: altoPx },
          type: tipo,
        }),
      ],
    }),
    P(leyenda, { align: AlignmentType.CENTER, italics: true, size: 18, color: GRIS, after: 200 }),
  ];
}

// ------------------------------------------------------------------ Carátula
const lineaFina = {
  bottom: { style: BorderStyle.SINGLE, size: 12, color: ACC, space: 10 },
};

const portada = [
  aire(600),
  P('INSTITUTO SUPERIOR SISE', { align: AlignmentType.CENTER, bold: true, size: 28, color: PRIM, after: 80 }),
  P('CARRERA PROFESIONAL DE DESARROLLO DE SISTEMAS DE INFORMACIÓN', { align: AlignmentType.CENTER, bold: true, size: 21, color: '20262B', after: 60 }),
  P('CURSO: E-BUSINESS', { align: AlignmentType.CENTER, bold: true, size: 21, color: ACC, after: 700 }),

  P('PROYECTO DE INVESTIGACIÓN APLICADA EN E-BUSINESS', { align: AlignmentType.CENTER, bold: true, size: 20, color: GRIS, after: 120 }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: 'VetPet Connect — VetPet Surco E.I.R.L.', font: 'Cambria', bold: true, size: 44, color: PRIM })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 140 },
    border: lineaFina,
    children: [new TextRun({
      text: 'Portal Integral de Comercio Electrónico B2C, Suscripción Recurrente e Historia Clínica Digital',
      font: 'Cambria', bold: true, size: 26, color: '20262B',
    })],
  }),

  aire(500),
  tabla(['Rubro', 'Detalle del Proyecto Académico'], [
    ['Institución Educativa', 'Instituto Superior SISE'],
    ['Carrera Profesional', 'Desarrollo de Sistemas de Información'],
    ['Asignatura', 'E-Business'],
    ['Empresa Objeto de Estudio', 'VetPet Surco E.I.R.L. (RUC referencial 20609512847 — Santiago de Surco, Lima)'],
    ['Solución Propuesta', 'VetPet Connect (Tienda Virtual B2C + Suscripción Mensual + CRM Clínico)'],
    ['Integrantes (Equipo 4)', '1. [Apellido, Nombre — Integrante 1]\n2. [Apellido, Nombre — Integrante 2]\n3. [Apellido, Nombre — Integrante 3]\n4. [Apellido, Nombre — Integrante 4]'],
    ['Ciclo y Año Académico', 'Semestre VI — 2026'],
  ], [3100, 6538], { primeraNegrita: true }),

  aire(700),
  P('Lima — Perú', { align: AlignmentType.CENTER, bold: true, size: 22, color: PRIM, after: 40 }),
  P('2026', { align: AlignmentType.CENTER, bold: true, size: 22, color: GRIS, after: 0 }),
];

// ----------------------------------------------------------------- Contenido
const cuerpo = [];
const add = (...x) => cuerpo.push(...x);

// INTRODUCCIÓN
add(H('Introducción', HeadingLevel.HEADING_1));

add(H('Breve descripción de la empresa elegida', HeadingLevel.HEADING_2));
add(P('VetPet Surco E.I.R.L. (nombre comercial VetPet Surco, con RUC referencial 20609512847) es una micro y pequeña empresa (MYPE) peruana ubicada en la Av. Velasco Astete 1245, distrito de Santiago de Surco, Lima. Su giro de negocio articula dos líneas complementarias: la comercialización minorista de productos para mascotas (alimento balanceado super premium para perros y gatos, arena sanitaria, accesorios y medicamentos veterinarios de venta libre) y la prestación de servicios veterinarios preventivos (consulta general, vacunación, desparasitación y baño/grooming). Opera con un local físico y seis colaboradores: dos médicos veterinarios, un especialista en grooming y tres encargados de tienda y atención en mostrador.'));

add(H('Objetivos del proyecto', HeadingLevel.HEADING_2));
add(P('Objetivo general: Implementar una plataforma integral de comercio electrónico B2C denominada VetPet Connect que integre la venta en línea de productos con pasarela de pagos, un modelo de suscripción mensual de despacho recurrente y una historia clínica digital con alertas automáticas de salud, con el fin de estabilizar los ingresos mensuales de VetPet Surco E.I.R.L. y elevar la fidelización de sus clientes durante el primer año de operación.', { bold: false }));
add(P('Objetivos específicos:', { bold: true, after: 80 }));
add(tabla(['#', 'Objetivo Específico', 'Indicador / Meta', 'Plazo'], [
  ['OE-1', 'Incrementar el volumen de ventas mensuales recurrentes de alimento balanceado y arena sanitaria mediante el modelo de Suscripción Mensual.', '+30 % en ventas recurrentes', '6 meses'],
  ['OE-2', 'Reducir las inasistencias y atrasos en controles de vacunación y desparasitación mediante alertas automáticas generadas desde la historia clínica digital.', '−40 % en inasistencias', '12 meses'],
  ['OE-3', 'Automatizar el registro de transacciones de venta en línea con descuento en tiempo real del inventario, eliminando la sobreventa y los quiebres de stock.', '100 % de pedidos sincronizados', '3 meses'],
], [800, 5238, 2200, 1400], { primeraNegrita: true }));
add(aire(120));

add(H('Enfoque y alcance de la solución web planteada', HeadingLevel.HEADING_2));
add(P('La solución VetPet Connect se diseñó e implementó como una aplicación web transaccional sobre Laravel 12 (PHP 8.2) y MySQL 8.0, contenerizada con Docker (Apache 2.4 con SSL/TLS, MySQL 8.0 y MailHog). Su alcance abarca tanto el sitio institucional público (Inicio, Nosotros, Productos y Servicios, y Contacto) como una plataforma transaccional con control de acceso basado en tres roles estrictos:'));
add(...vinetas([
  'Módulo del Cliente (CLIENTE): Catálogo filtrable con semáforo de disponibilidad, carrito de compras en sesión, confirmación transaccional con bloqueo de stock, pago en línea con tarjeta mediante Culqi, registro de mascotas, contratación/pausa/cancelación de planes de suscripción mensual, reserva de citas sin cruce de horarios y asistente virtual integrado (Pelusa).',
  'Módulo del Médico Veterinario (VETERINARIO): Agenda del día, cierre de citas según desenlace (ATENDIDA, CANCELADA, NO_ASISTIO) y registro del diagnóstico, tratamiento, vacuna y fecha del próximo control en la historia clínica digital.',
  'Módulo del Administrador (ADMIN): Dashboard analítico de ventas puntuales y recurrentes, alta de productos con SKU único, control de inventario con semáforo de reposición (VERDE, AMARILLO, ROJO), avance secuencial de estados de pedidos y monitoreo de alertas clínicas.',
]));

// CAPÍTULO I
add(H('Capítulo I: Planeamiento Estratégico y Modelos de Negocio', HeadingLevel.HEADING_1));

add(H('1.1. Perfil e infraestructura de la empresa: Diagnóstico actual del negocio', HeadingLevel.HEADING_2));
add(P('Previo a la implementación de VetPet Connect, VetPet Surco operaba de manera completamente manual y presencial, lo que generaba cinco problemas operativos críticos que limitaban su crecimiento a la capacidad física del mostrador:'));
add(tabla(['Área Operativa', 'Diagnóstico de la Situación Previa', 'Impacto Comercial y Operativo'], [
  ['Agenda veterinaria', 'Coordinación por llamadas telefónicas o WhatsApp personal sin agenda centralizada.', 'Cruces de horario entre los dos veterinarios y pérdida de clientes fuera del horario de oficina.'],
  ['Historia clínica', 'Fichas físicas de cartón archivadas manualmente en el local.', 'Pérdida o deterioro de antecedentes médicos e imposibilidad de consulta remota.'],
  ['Control de inventario', 'Registro manual en cuaderno y hojas de cálculo desconectadas de la venta.', 'Quiebres de stock en alimento de alta rotación en quincena y sobre-stock en accesorios.'],
  ['Canal de venta', 'Venta exclusiva en el mostrador físico de la Av. Velasco Astete.', 'Ingresos dependientes del tráfico peatonal y caídas fuera de campañas de vacunación.'],
  ['Fidelización', 'Ausencia de recordatorios automáticos de salud o de recompra de alimento.', 'Dueños que olvidan refuerzos de vacunas o compran alimento de urgencia en supermercados.'],
], [2000, 3819, 3819], { primeraNegrita: true }));
add(aire(120));

add(H('1.2. Planeamiento estratégico: Visión, misión, objetivos del negocio y planteamiento del caso', HeadingLevel.HEADING_2));
add(...vinetas([
  'Misión: Brindar atención veterinaria preventiva de calidad y abastecimiento confiable de alimentos, medicamentos y accesorios para mascotas en Santiago de Surco, integrando calidez humana con una plataforma digital que simplifique el cuidado oportuno de cada animal.',
  'Visión: Consolidarse hacia el 2028 como el centro veterinario y pet shop líder en innovación digital de Lima Sur, reconocido por su modelo de suscripción nutricional recurrente y su trazabilidad clínica en línea.',
  'Valores corporativos: Prevención clínica (priorizar el calendario sanitario al día), Transparencia comercial (precios claros en Soles con IGV incluido y stock real) y Compromiso continuo con el bienestar de la mascota.',
]));
add(P('Planteamiento del caso: Aunque VetPet Surco goza de prestigio médico en su vecindario, perdía gran parte del gasto mensual recurrente en alimentación (que representa más del 65 % del presupuesto anual del dueño de una mascota) frente a cadenas grandes o aplicativos de reparto por carecer de un canal digital de recompra programada. La propuesta alinea la tecnología con el negocio convirtiendo la compra ocasional en una relación digital continua mediante suscripciones mensuales automatizadas y alertas médicas ligadas al expediente clínico.'));

add(H('1.3. Modelo de negocio electrónico: Definición del modelo e-Business seleccionado y justificación', HeadingLevel.HEADING_2));
add(P('VetPet Connect implementa un modelo de negocio electrónico B2C (Business to Consumer) híbrido, que combina la venta minorista en línea (e-tailing) con el modelo de suscripción recurrente y la reserva de servicios profesionales. Su elección se sustenta en tres pilares:'));
add(...vinetas([
  'Relación directa empresa–consumidor final: La venta de productos, la afiliación a planes mensuales y la reserva de citas se realizan directamente entre VetPet Surco E.I.R.L. y el dueño de la mascota (persona natural consumidora final), sin intermediación entre empresas.',
  'Relación uno-a-muchos estandarizada y personalizada: Una misma plataforma atiende simultáneamente a cientos de hogares del distrito bajo reglas comerciales uniformes, personalizando las alertas y recomendaciones según la especie (PERRO o GATO), edad y peso de cada mascota.',
  'Oportunidad en el mercado peruano: El sector de cuidado de mascotas en el Perú proyecta crecer de US$ 456 millones a US$ 680 millones entre 2023 y 2028 (con más del 60 % de hogares peruanos con mascota), mientras que el canal e-commerce representa apenas el 7 % de las ventas totales, abriendo un espacio de diferenciación inmediata para una MYPE digitalizada.',
]));

add(H('1.4. Integración de la gestión empresarial: CRM, ERP, SRM y E-Procurement', HeadingLevel.HEADING_2));
add(P('La plataforma articula los sistemas de gestión empresarial sobre un modelo de datos único y coherente:'));
add(...vinetas([
  'Estrategia e importancia del CRM (Customer Relationship Management): El CRM se estructura alrededor de la relación Dueño (usuarios) – Mascota (mascotas). Consolida el perfil de cada animal, sus compras, sus planes de suscripción y sus atenciones médicas (historias_clinicas). A partir del campo proxima_fecha registrado por el veterinario, el comando diario vetpet:recordatorios detecta los controles que vencen en los próximos 15 días (RN-20) y envía alertas personalizadas por correo electrónico. Además, el asistente virtual Pelusa atiende consultas en tiempo real sobre pedidos, citas y stock.',
  'Fundamentos del ERP y SRM de cara al negocio y proveedores: Cada pedido confirmado (sea de origen PUNTUAL o SUSCRIPCION) descuenta automáticamente el stock_actual en la tabla productos dentro de una transacción ACID. El módulo administrativo (ERP) distingue los ingresos puntuales de los recurrentes (RN-14) y controla el ciclo logístico (PENDIENTE, PAGADO, ENVIADO, ENTREGADO). Hacia los proveedores (SRM), el sistema vigila permanentemente el umbral de abastecimiento de cada SKU.',
  'Análisis del modelo E-Procurement para los procesos de compra/venta: El aprovisionamiento electrónico se automatiza mediante el servicio InventarioService (RN-08), que evalúa cada producto con un semáforo de tres estados: VERDE (stock_actual > punto_reorden * 2), AMARILLO (stock_actual <= punto_reorden * 2 y > punto_reorden) y ROJO (stock_actual <= punto_reorden). El panel administrativo agrupa automáticamente los ítems en ROJO y AMARILLO para emitir órdenes de reposición oportunas a los distribuidores de alimento y laboratorios, evitando quiebres de stock en los despachos recurrentes.',
]));

// CAPÍTULO II
add(H('Capítulo II: Arquitectura, Diseño y Contenidos Web', HeadingLevel.HEADING_1));

add(H('2.1. Arquitectura de la aplicación: Estructura técnica de la solución e-Business', HeadingLevel.HEADING_2));
add(P('La solución sigue una arquitectura en capas desplegada sobre contenedores Docker, combinando el patrón MVC de Laravel 12 con una Capa de Servicios de Dominio dedicada:'));
add(tabla(['Capa Arquitectónica', 'Componentes Técnicos', 'Responsabilidad en VetPet Connect'], [
  ['1. Infraestructura (Docker)', 'Apache 2.4 + PHP 8.2, MySQL 8.0, MailHog', 'Aislamiento del entorno, soporte HTTPS/SSL (puerto 443), persistencia relacional y auditoría de correos SMTP.'],
  ['2. Presentación (Frontend)', 'Laravel Blade, HTML5, CSS3 nativo, SVG, pelusa.js', 'Renderizado del sitio institucional y de los módulos por rol, diseño responsivo mobile-first y widget del chatbot.'],
  ['3. Control y Seguridad HTTP', '11 Controllers, 5 FormRequests, Middleware EnsureRol', 'Autenticación, autorización RBAC por rol, protección CSRF, limitación de tasa (throttle) y validación de entradas.'],
  ['4. Servicios de Dominio', 'CarritoService, PedidoService, PagoService, SuscripcionService, DespachoService, AgendaService, HistoriaClinicaService, InventarioService, AsistenteService', 'Ejecución de las 22 reglas de negocio, cálculo en céntimos, transacciones ACID con bloqueo FOR UPDATE e integración con Culqi.'],
  ['5. Persistencia (Datos)', '9 tablas de dominio en MySQL 8.0 (InnoDB)', 'Integridad referencial (FOREIGN KEY) y reglas declarativas en el motor (CHECK y UNIQUE).'],
], [2200, 3400, 4038], { primeraNegrita: true }));
add(aire(120));

add(H('2.2. Diseño de interfaces y tecnologías web: Usabilidad y tecnologías utilizadas', HeadingLevel.HEADING_2));
add(...vinetas([
  'Diseño Responsivo (Mobile-First, RNF-01): Construido con CSS3 nativo (CSS Grid, Flexbox y custom properties) sin dependencia de frameworks pesados. Un punto de quiebre en 760px adapta las rejillas y convierte las tablas operativas en tarjetas legibles en teléfonos móviles.',
  'Rendimiento y Velocidad de Carga (RNF-04): Las vistas públicas no cargan librerías JavaScript externas y emplean gráficos vectoriales SVG de pocos kilobytes, garantizando tiempos de carga inferiores a 3 segundos en redes móviles.',
  'Accesibilidad Web (WCAG 2.1): Estructura HTML5 semántica (header, nav, main, section, article, footer), enlace para saltar al contenido principal, indicador aria-current="page", tablas con scope="col", foco visible por teclado y soporte para prefers-reduced-motion.',
]));

add(H('2.3. Generación de contenidos: Contenidos estáticos y contenidos dinámicos', HeadingLevel.HEADING_2));
add(P('El portal separa claramente la información institucional estática de los módulos transaccionales dinámicos:'));
add(tabla(['Tipo de Contenido', 'Rutas y Vistas Implementadas', 'Detalle Funcional'], [
  ['Contenidos Estáticos', 'GET / (inicio.blade.php)\nGET /nosotros (nosotros.blade.php)\nGET /productos (productos.blade.php)\nGET /contacto (contacto.blade.php)', 'Presentación de la empresa (razón social, RUC, dirección en Surco), misión, visión, valores, equipo veterinario, vitrina de categorías, tarifario transparente de servicios clínicos, comparativa de planes mensuales y formulario de contacto con envío al buzón corporativo.'],
  ['Contenidos Dinámicos', 'GET /app/catalogo\nGET /app/carrito\nGET/POST /app/pedidos/{id}/pagar\nGET/POST /app/citas\nGET/POST /app/mascotas\nGET /app/clinica\nGET /app/admin\nPOST /app/ayuda/consultar', 'Catálogo en vivo conectado a MySQL con filtro por categoría y semáforo de stock en tiempo real; carrito persistente en sesión; checkout con desglose de IGV (18 %) y pasarela Culqi; agenda que bloquea horarios ocupados en vivo; ficha clínica veterinaria; panel ERP/CRM administrativo y asistente Pelusa con respuestas personalizadas según los datos de la cuenta.'],
], [2100, 2900, 4638], { primeraNegrita: true }));
add(aire(120));

add(H('2.4. Modelo implementado (según el rubro de la empresa): Detalles de la Tienda Virtual (E-commerce)', HeadingLevel.HEADING_2));
add(P('Por el rubro de VetPet Surco E.I.R.L. (veterinaria y pet shop), se implementó VetPet Connect, una Tienda Virtual E-commerce bajo el modelo B2C (Business to Consumer) que integra la venta de productos para mascotas con la gestión de servicios veterinarios en una sola plataforma web. La solución se estructura en tres pilares:'));
add(...vinetas([
  '1. Tienda en línea y pasarela de pagos (E-commerce transaccional): Catálogo clasificado en Alimento, Accesorios y Medicamentos de venta libre con disponibilidad en tiempo real, carrito de compras que opera en céntimos enteros, confirmación atómica con bloqueo de fila (SELECT ... FOR UPDATE para evitar sobreventa) y cobro con tarjeta mediante la pasarela Culqi.',
  '2. Suscripción mensual recurrente (Fidelización e ingresos estables): Permite afiliar a cada mascota a un plan mensual de alimento o arena (Plan Básico: S/ 99.00 por 1 unidad; Plan Cuidado: S/ 149.00 por 2 unidades; Plan Integral: S/ 219.00 por 3 unidades). El comando programado suscripciones:despachar emite automáticamente los pedidos recurrentes cada 30 días, descuenta el stock y notifica el despacho por correo.',
  '3. Servicios veterinarios, CRM clínico y control ERP: Reserva de citas en línea sin cruce de horarios, registro de historia clínica digital por el veterinario, envío automático de recordatorios de vacunación/desparasitación (15 días antes del vencimiento), asistente virtual Pelusa y panel administrativo con semáforo de reposición de inventario.',
]));

// CAPÍTULO III
add(H('Capítulo III: Reglas de Negocio, Pasarela de Pagos y Carrito de Compras', HeadingLevel.HEADING_1));

add(H('3.1. Reglas del negocio electrónico', HeadingLevel.HEADING_2));
add(P('El sistema hace cumplir 22 reglas de negocio en dos niveles complementarios (capa de servicios en PHP/Laravel y restricciones declarativas CHECK, UNIQUE y FOREIGN KEY en MySQL 8.0), verificadas mediante pruebas automatizadas en PHPUnit:'));
add(tabla(['Código', 'Regla de Negocio', 'Mecanismo de Control (Laravel + MySQL)'], [
  ['RN-01', 'Cada persona tiene un único rol excluyente (CLIENTE, VETERINARIO, ADMIN).', 'Columna ENUM usuarios.rol + Middleware EnsureRol.'],
  ['RN-02', 'Un correo electrónico identifica a una sola cuenta.', 'Índice UNIQUE (correo) en usuarios + RegistroRequest.'],
  ['RN-03', 'La contraseña nunca se almacena en texto legible.', 'Hash BCrypt (Hash::make) en usuarios.password_hash.'],
  ['RN-04', 'Toda mascota pertenece obligatoriamente a un cliente registrado.', 'FOREIGN KEY (cliente_id) hacia usuarios.'],
  ['RN-05', 'Cada producto tiene un código SKU único e irrepetible.', 'Índice UNIQUE (codigo_sku) en productos.'],
  ['RN-06', 'Ningún producto se registra ni vende a precio cero o negativo.', 'Restricción CHECK (precio > 0) + CrearProductoRequest.'],
  ['RN-07', 'El inventario de un producto nunca queda en negativo.', 'Restricción CHECK (stock_actual >= 0) + InventarioService.'],
  ['RN-08', 'El semáforo de inventario decide cuándo reponer un producto.', 'InventarioService::semaforo() (VERDE, AMARILLO, ROJO).'],
  ['RN-09', 'Un producto aparece una sola vez por pedido (se acumula cantidad).', 'Índice UNIQUE uk_linea_pedido + CarritoService::agregar().'],
  ['RN-10', 'No se compran cantidades menores o iguales a cero.', 'Restricción CHECK (cantidad > 0) + CantidadInvalidaException.'],
  ['RN-11', 'El precio de un pedido emitido queda registrado históricamente.', 'Columna detalle_pedidos.precio_unitario.'],
  ['RN-12', 'Sin stock suficiente para todos los ítems no se emite el pedido.', 'Transacción ACID con SELECT ... FOR UPDATE en PedidoService.'],
  ['RN-13', 'El pedido recorre una secuencia estricta de estados sin saltos.', 'PENDIENTE -> PAGADO -> ENVIADO -> ENTREGADO (EstadoPedido).'],
  ['RN-14', 'Se distingue toda compra puntual del despacho por suscripción.', 'Columna ENUM pedidos.tipo_origen (PUNTUAL, SUSCRIPCION).'],
  ['RN-15', 'El cliente puede pausar, reactivar o cancelar su plan cuando quiera.', 'SuscripcionService::cambiarEstado().'],
  ['RN-16', 'Cada plan registra su frecuencia (30 días) y fecha de próximo despacho.', 'Columnas frecuencia_dias y proximo_despacho en suscripciones.'],
  ['RN-17', 'Un veterinario no atiende dos citas en la misma fecha y hora.', 'Índice UNIQUE uk_agenda (veterinario_id, fecha_hora).'],
  ['RN-18', 'Toda cita registra su desenlace (ATENDIDA, CANCELADA, NO_ASISTIO).', 'AgendaService::cerrar() desde estado RESERVADA.'],
  ['RN-19', 'Cada cita atendida genera un único registro de historia clínica.', 'Índice UNIQUE (cita_id) en historias_clinicas.'],
  ['RN-20', 'Se alerta con 15 días de anticipación todo control médico programado.', 'HistoriaClinicaService::recordatorios(15) + comando diario.'],
  ['RN-21', 'Un pedido solo pasa a PAGADO si la pasarela aprueba el cargo.', 'Tabla pagos (APROBADO/RECHAZADO) + PagoService::cobrar().'],
  ['RN-22', 'Una mascota no duplica una suscripción vigente del mismo producto.', 'Validación de unicidad en SuscripcionService::contratar().'],
], [1100, 4538, 4000], { primeraNegrita: true }));
add(aire(120));

add(H('3.2. Simulación del carrito de compras: Flujo desde la selección hasta el checkout', HeadingLevel.HEADING_2));
add(P('El flujo transaccional de compra fue diseñado para garantizar exactitud aritmética y cero sobreventa:'));
add(tabla(['Paso', 'Acción del Cliente', 'Procesamiento Interno del Sistema (Laravel + MySQL)'], [
  ['1', 'Inicia sesión y navega al Catálogo (/app/catalogo).', 'Autentica con BCrypt, carga el rol CLIENTE y muestra productos activos con su semáforo de stock.'],
  ['2', 'Selecciona cantidad y pulsa "Agregar al carrito".', 'CarritoService::agregar() valida cantidad > 0 (RN-10) y stock disponible. Si el SKU ya estaba en el carrito, acumula la cantidad en la misma línea (RN-09).'],
  ['3', 'Revisa el carrito (/app/carrito) o ajusta unidades.', 'Calcula subtotales y total general operando en céntimos enteros (int) para evitar errores de punto flotante IEEE 754.'],
  ['4', 'Pulsa "Confirmar pedido" (POST /app/carrito/confirmar).', 'PedidoService::confirmar() abre una transacción DB, ordena los IDs y bloquea las filas de productos con SELECT ... FOR UPDATE.'],
  ['5', 'Validación atómica de stock (RN-12).', 'Si algún producto no alcanza, ejecuta ROLLBACK completo e informa el faltante. Si todos alcanzan, descuenta stock_actual, crea el pedido en PENDIENTE y limpia el carrito.'],
  ['6', 'Pasa al Checkout (/app/pedidos/{id}/pagar).', 'Presenta el resumen fiscal (Subtotal sin IGV, IGV 18 % y Total en Soles) y el formulario de tarjeta tokenizado con Culqi.'],
  ['7', 'Envía el pago con tarjeta (POST /app/pedidos/{id}/pagar).', 'PagoService::cobrar() procesa el token contra la pasarela, registra el intento en la tabla pagos (RN-21), actualiza el pedido a PAGADO y envía la factura por correo.'],
], [900, 3300, 5438], { primeraNegrita: true }));
add(aire(120));

add(H('3.3. Pasarela de pagos y normativa aplicable al consumidor', HeadingLevel.HEADING_2));
add(P('Configuración del pago electrónico (Culqi): VetPet Connect integra la pasarela peruana Culqi mediante una arquitectura basada en la interfaz Pasarela (con las implementaciones PasarelaCulqi para cargos reales y PasarelaSimulada para pruebas controladas). En el navegador, el script de Culqi Checkout captura los datos de la tarjeta (Visa o Mastercard) y genera un token efímero (tkn_...). De este modo, el servidor de VetPet Surco jamás recibe ni almacena números de tarjeta ni códigos CVV, alineándose con el estándar PCI-DSS. El backend consume el endpoint https://api.culqi.com/v2/charges enviando el importe en céntimos y moneda PEN, registrando la auditoría completa (marca, últimos 4 dígitos, código de cargo y estado APROBADO/RECHAZADO) en la tabla pagos.'));
add(P('Normativa legal y protección al consumidor aplicada:', { bold: true, after: 80 }));
add(...vinetas([
  'Ley N.° 29733 — Ley de Protección de Datos Personales: Cifrado irreversible de contraseñas con BCrypt (RNF-02), recolección mínima de datos para el despacho y aislamiento estricto de los expedientes clínicos y pedidos de cada titular.',
  'Ley N.° 29571 — Código de Protección y Defensa del Consumidor (INDECOPI): Exhibición de precios totales en moneda nacional (Soles, S/) incluyendo el IGV (18 %), respeto irrestricto del precio unitario pactado al confirmar el pedido (RN-11), emisión inmediata de comprobante electrónico por correo y derecho del usuario a pausar o cancelar su suscripción mensual en cualquier momento sin penalidades (RN-15).',
]));

// CAPÍTULO IV
add(H('Capítulo IV: Seguridad, Gestión de Contenidos y Marketing Digital', HeadingLevel.HEADING_1));

add(H('4.1. Seguridad en transacciones electrónicas', HeadingLevel.HEADING_2));
add(P('La seguridad transaccional de VetPet Connect se implementó bajo un esquema de defensa en profundidad que protege el canal de comunicación, la sesión del usuario, la aplicación y el motor de base de datos:'));
add(...vinetas([
  'Certificados SSL/TLS (HTTPS): Configuración del módulo mod_ssl en Apache 2.4 (docker/default-ssl.conf) en el puerto 443 con certificados X.509 RSA de 2048 bits (generar-certificados.sh), cifrando todo el tráfico entre el cliente y el servidor.',
  'Cifrado de contraseñas y protección de sesiones: Almacenamiento de claves mediante hash BCrypt con sal aleatoria (Hash::make). Regeneración del identificador de sesión al autenticar (session()->regenerate()) para impedir ataques de Session Fixation, y cookies configuradas con banderas HttpOnly y SameSite=lax.',
  'Protección contra CSRF, XSS, SQL Injection y Fuerza Bruta: Validación obligatoria de tokens @csrf en todas las peticiones POST, PATCH y DELETE; consultas 100 % parametrizadas vía PDO/Eloquent que neutralizan la inyección SQL; escape automático de vistas Blade y uso de textContent en el DOM; y limitación de tasa (throttle) en endpoints públicos y del asistente.',
  'Autorización por Roles (RBAC) y Bloqueos Transaccionales: El middleware EnsureRol restringe cada módulo a su perfil autorizado (403 Forbidden), mientras que las transacciones ACID con SELECT ... FOR UPDATE garantizan que dos compras simultáneas del último artículo en stock nunca produzcan sobreventa.',
]));

add(H('4.2. Gestor de contenidos (CMS): Arquitectura y entorno de administración', HeadingLevel.HEADING_2));
add(P('Durante el diseño de la solución se evaluó utilizar un gestor de contenidos tradicional (como WordPress con WooCommerce). No obstante, se determinó técnicamente que un CMS genérico no soporta de manera nativa las reglas de dominio de una clínica veterinaria: asociar múltiples mascotas por cliente, controlar suscripciones recurrentes por mascota (RN-22), impedir cruces de horario por médico veterinario (RN-17) y emitir alertas automáticas de vacunación desde la historia clínica (RN-20).'));
add(P('Por ello, se construyó un Panel de Administración y Gestión de Contenidos a medida sobre Laravel 12 (/app/admin, gestionado por AdminController), desde el cual el administrador de VetPet Surco gobierna toda la operación web sin tocar código:'));
add(...vinetas([
  'Gestión del catálogo de productos: Formulario de alta de productos con validación automática de SKU único (RN-05), categoría (ALIMENTO, MEDICAMENTO, ACCESORIO), precio positivo (RN-06), stock inicial (RN-07) y punto de reorden.',
  'Tablero de control de inventario (Semáforo ERP/SRM): Tabla dinámica que clasifica el stock en VERDE, AMARILLO y ROJO para ejecutar las compras de reposición.',
  'Administración del flujo de pedidos: Control secuencial del estado de cada orden (PENDIENTE -> PAGADO -> ENVIADO -> ENTREGADO, RN-13) diferenciando compras puntuales de despachos por suscripción (RN-14).',
  'Monitoreo de KPIs y alertas clínicas: Indicadores en tiempo real de venta total registrada, venta recurrente por suscripciones, planes activos y controles médicos próximos a vencer.',
]));

add(H('4.3. Estrategia de E-Marketing y Alta en Buscadores (SEO)', HeadingLevel.HEADING_2));
add(P('Para atraer tráfico calificado en Lima Sur y convertir visitantes en suscriptores recurrentes, se implementaron tres líneas de acción digital:'));
add(...vinetas([
  'Plan de posicionamiento y redes sociales: Difusión de contenido de valor (calendarios de vacunación, guías de nutrición por peso y edad, cuidados post-baño) en Instagram y TikTok segmentado geográficamente para propietarios de mascotas en Santiago de Surco y distritos limítrofes, dirigiendo el tráfico hacia la calculadora de planes de suscripción del portal.',
  'Automatización de Boletines y Correos Transaccionales (Email Marketing / CRM): Implementación de 8 flujos de correo HTML con diseño corporativo (CorreoService y plantillas en resources/views/emails/): correo de bienvenida al registrarse, confirmación de pedido, factura electrónica con IGV, confirmación de cita médica, aviso de cambio en suscripción, notificación de despacho mensual automático (03:00 a. m.) y boletín preventivo de recordatorio de vacunación/desparasitación enviado automáticamente 15 días antes del vencimiento (08:00 a. m.).',
  'Tácticas SEO On-Page y Alta en Buscadores: Configuración del archivo public/robots.txt (User-agent: * / Disallow:) para habilitar el rastreo de las páginas públicas; inclusión de etiquetas meta description específicas por página, protocolo Open Graph (og:title, og:description, og:type, og:locale="es_PE") para previsualizaciones enriquecidas en redes sociales, marcado semántico HTML5 con jerarquía limpia de encabezados (h1-h3), URLs amigables y registro proyectado en Google Search Console y Google Business Profile (Google Maps) para búsquedas locales ("veterinaria en Surco", "delivery alimento mascotas Surco").',
]));

// CAPÍTULO V
add(H('Capítulo V: Entregable Digital (Publicación del Caso)', HeadingLevel.HEADING_1));

add(H('5.1. Enlace al Blog Corporativo', HeadingLevel.HEADING_2));
add(P('El caso de investigación aplicada de VetPet Surco E.I.R.L. y la arquitectura completa de la plataforma VetPet Connect se encuentran publicados y estructurados en el siguiente Blog Corporativo:'));
add(tabla(['Recurso Digital', 'Dirección URL / Ubicación'], [
  ['Blog Corporativo del Caso', '[Pegar aquí el enlace público de tu Blog en Blogger / WordPress / Notion, p. ej.: https://vetpetsurco-ebusiness.blogspot.com]'],
  ['Repositorio y Código Fuente', 'Aplicación Laravel 12 + MySQL 8.0 + Docker (carpeta public_html/ y docker/)'],
], [3000, 6638], { primeraNegrita: true }));
add(aire(140));

add(H('5.2. Capturas de pantalla de la solución implementada', HeadingLevel.HEADING_2));
add(P('A continuación se presenta la evidencia visual del sitio institucional público, la simulación del carrito de compras, el bloqueo contra sobreventa, la agenda médica, la historia clínica y el panel administrativo de VetPet Connect:'));

add(...figura('docs/capturas/index.jpg', 'Figura 1. Sitio institucional público de VetPet Surco — Página de Inicio (Propuesta de valor B2C).', 510, 300));
add(...figura('docs/capturas/productos.jpg', 'Figura 2. Vitrina pública de productos por categoría, tarifario clínico y planes de suscripción mensual.', 510, 300));
add(...figura('docs/capturas-reglas/01-ingreso.png', 'Figura 3. Control de acceso diferenciado por rol (RN-01) y autenticación segura con BCrypt (RN-03).', 510, 290));
add(...figura('docs/capturas-reglas/03-catalogo.png', 'Figura 4. Catálogo transaccional del Cliente con precios en Soles, SKU único y semáforo de stock en vivo.', 510, 290));
add(...figura('docs/capturas-reglas/04-carrito.png', 'Figura 5. Simulación del Carrito de Compras: acumulación sin duplicar líneas (RN-09) y cálculo exacto del total.', 510, 290));
add(...figura('docs/capturas-reglas/05-carrito-bloqueado.png', 'Figura 6. Protección contra sobreventa (RN-12): bloqueo transaccional cuando el stock es insuficiente.', 510, 290));
add(...figura('docs/capturas-reglas/06-agenda.png', 'Figura 7. Reserva de citas veterinarias con bloqueo automático de horarios ya ocupados (RN-17).', 510, 290));
add(...figura('docs/capturas-reglas/07-mascotas.png', 'Figura 8. Módulo de Mascotas y contratación/gestión de planes de Suscripción Mensual recurrente (RN-15, RN-16).', 510, 290));
add(...figura('docs/capturas-reglas/08-clinica.png', 'Figura 9. Módulo del Veterinario: registro de Historia Clínica Digital y programación del próximo control (RN-19, RN-20).', 510, 290));
add(...figura('docs/capturas-reglas/09-inventario.png', 'Figura 10. Panel Administrativo (CMS/ERP): KPIs del negocio y semáforo de reposición de inventario (RN-08).', 510, 290));
add(...figura('docs/capturas-reglas/10-pedidos.png', 'Figura 11. Gestión del flujo secuencial de pedidos (RN-13) y distinción entre compra puntual y suscripción (RN-14).', 510, 290));

// CONCLUSIONES Y RECOMENDACIONES
add(H('Conclusiones y Recomendaciones', HeadingLevel.HEADING_1));

add(H('Conclusiones', HeadingLevel.HEADING_2));
add(...vinetas([
  '1. Ventaja competitiva mediante ingresos recurrentes predecibles: La implementación del modelo de suscripción mensual de alimento y arena sanitaria en VetPet Connect permite a VetPet Surco superar la estacionalidad de las ventas de mostrador, asegurando un flujo de caja constante y predecible cada 30 días.',
  '2. Integración efectiva de CRM clínico y ERP comercial: Conectar la historia clínica digital y sus alertas automáticas de vacunación (15 días antes del vencimiento) con el catálogo y el inventario en tiempo real transforma el cuidado preventivo de la mascota en un motor de fidelización y recompra continua.',
  '3. Rigor transaccional y seguridad en el comercio electrónico: La combinación de transacciones ACID con bloqueo pesimista (SELECT ... FOR UPDATE), aritmética en céntimos enteros, tokenización de tarjetas mediante Culqi y restricciones CHECK/UNIQUE en MySQL garantiza cero sobreventa de stock y protege tanto al consumidor como al negocio.',
  '4. Lecciones aprendidas en la alineación entre TI y estrategia comercial: El proyecto demostró que la arquitectura de software debe responder directamente a los dolores reales de la organización; cada una de las 22 reglas de negocio codificadas y probadas resuelve un problema concreto diagnosticado en el local (cruces telefónicos de citas, pérdida de fichas en cartón y quiebres de inventario en quincena).',
]));

add(H('Recomendaciones', HeadingLevel.HEADING_2));
add(...vinetas([
  '1. Despliegue productivo en la nube y respaldos automatizados: Publicar los contenedores Docker en un servidor cloud con certificados SSL renovables (Let\'s Encrypt) e implementar un trabajo programado diario de respaldo (mysqldump) hacia almacenamiento externo.',
  '2. Ampliación de medios de pago digitales locales: Complementar la pasarela de tarjetas Culqi incorporando pagos inmediatos mediante billeteras móviles (Yape y Plin) para agilizar aún más la conversión desde teléfonos celulares.',
  '3. Omnicanalidad en las notificaciones del CRM: Integrar los recordatorios automáticos de vacunación y los avisos de despacho mensual con la API de WhatsApp Business como canal complementario al correo electrónico.',
]));

// BIBLIOGRAFÍA
add(H('Bibliografía', HeadingLevel.HEADING_1));
add(...vinetas([
  'Chaffey, D., & Ellis-Chadwick, F. (2019). Digital marketing: Strategy, implementation and practice (7.ª ed.). Pearson.',
  'Cisneros Canlla, E. (2017). E-commerce: Comercio electrónico (1.ª ed.). Editorial Macro.',
  'Congreso de la República del Perú. (2010). Ley N.° 29571, Código de Protección y Defensa del Consumidor. Diario Oficial El Peruano.',
  'Congreso de la República del Perú. (2011). Ley N.° 29733, Ley de Protección de Datos Personales. Diario Oficial El Peruano.',
  'Laudon, K. C., & Laudon, J. P. (2020). Sistemas de información gerencial (16.ª ed.). Pearson Educación.',
  'Laudon, K. C., & Traver, C. G. (2021). E-commerce 2021: Business, technology, society (16.ª ed.). Pearson.',
  'Turban, E., Outland, J., King, D., Lee, J. K., Liang, T. P., & Turban, D. C. (2018). Electronic commerce 2018: A managerial and social networks perspective (9.ª ed.). Springer.',
]));

// ------------------------------------------------------------------ Documento
const doc = new Document({
  creator: 'Equipo 4 — Instituto Superior SISE',
  title: 'Trabajo Final — Proyecto de Investigación Aplicada en E-Business — VetPet Connect',
  description: 'Trabajo Final del curso de E-Business para VetPet Surco E.I.R.L.',
  numbering: {
    config: [{
      reference: 'puntos',
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 460, hanging: 240 } } },
      }],
    }],
  },
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 21, color: '20262B' },
        paragraph: { spacing: { after: 140, line: 276 } },
      },
      heading1: {
        run: { font: 'Cambria', size: 32, bold: true, color: PRIM },
        paragraph: { spacing: { before: 360, after: 200 } },
      },
      heading2: {
        run: { font: 'Cambria', size: 25, bold: true, color: '20262B' },
        paragraph: { spacing: { before: 280, after: 140 } },
      },
    },
  },
  sections: [{
    properties: {
      titlePage: true,
      page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134, header: 700, footer: 560 } },
    },
    headers: {
      first: new Header({ children: [new Paragraph({ children: [] })] }),
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C9D6D2', space: 6 } },
          children: [
            new TextRun({ text: 'Instituto Superior SISE — Proyecto de Investigación Aplicada en E-Business', size: 17, color: GRIS }),
            new TextRun({ children: [new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, relativeTo: 'margin', leader: PositionalTabLeader.NONE })], size: 17 }),
            new TextRun({ text: 'VetPet Connect (VetPet Surco)', size: 17, color: GRIS }),
          ],
        })],
      }),
    },
    footers: {
      first: new Footer({ children: [new Paragraph({ children: [] })] }),
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'Desarrollo de Sistemas de Información · Semestre VI · 2026', size: 17, color: GRIS }),
            new TextRun({ children: [new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, relativeTo: 'margin', leader: PositionalTabLeader.NONE })], size: 17 }),
            new TextRun({ children: ['Página ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES], size: 17, color: GRIS }),
          ],
        })],
      }),
    },
    children: [...portada, ...cuerpo],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, buf);
  console.log('Documento Word generado exitosamente en:', SALIDA);
});
