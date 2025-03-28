// scripts/create-test-user.js
// Este script crea un usuario de prueba con productos y descripciones de ejemplo

const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

const DEMO_USER = {
  email: "demo@describeia.com",
  password: "Demo123!",
  name: "Usuario Demo",
  isPro: true, // Configurar como usuario Pro para acceder a todas las funcionalidades
};

const DEMO_PRODUCTS = [
  {
    name: "Auriculares Bluetooth XT-500",
    category: "electronics",
    keywords: ["auriculares", "bluetooth", "inalámbrico", "audio", "música"],
    tone: "professional",
  },
  {
    name: "Cafetera Espresso Deluxe",
    category: "home",
    keywords: ["cafetera", "espresso", "café", "cocina", "electrodoméstico"],
    tone: "enthusiastic",
  },
  {
    name: "Zapatillas Running Pro Air",
    category: "sports",
    keywords: ["zapatillas", "running", "deportivas", "deporte", "correr"],
    tone: "energetic",
  },
];

const DEMO_DESCRIPTIONS = [
  {
    title: "Experiencia Sonora Premium",
    description:
      "Los auriculares Bluetooth XT-500 redefinen la experiencia auditiva con su tecnología de cancelación de ruido avanzada y batería de larga duración. Disfruta de hasta 30 horas de música ininterrumpida con una calidad de sonido excepcional que cautivará tus sentidos. Su diseño ergonómico asegura comodidad durante todo el día, mientras que su conectividad Bluetooth 5.2 garantiza una transmisión estable y sin interferencias. Perfectos para trabajo, deporte o viajes.",
    bullets: [
      "Cancelación activa de ruido para una inmersión total",
      "Hasta 30 horas de reproducción con una sola carga",
      "Bluetooth 5.2 para conexión estable a todos tus dispositivos",
      "Diseño ergonómico con almohadillas de memoria",
    ],
  },
  {
    title: "El Arte del Café Perfecto",
    description:
      "Transforma tu cocina en una auténtica cafetería italiana con la Cafetera Espresso Deluxe. Este elegante electrodoméstico combina la tradición del espresso con la más avanzada tecnología para ofrecerte la taza perfecta cada mañana. Su potente sistema de presión de 15 bares extrae todo el aroma y sabor del café, mientras que su vaporizador de leche te permite crear capuchinos y lattes dignos de un barista profesional. Con acabados en acero inoxidable y controles intuitivos, la Cafetera Espresso Deluxe es tan impresionante en diseño como en rendimiento.",
    bullets: [
      "Sistema de 15 bares de presión para un espresso auténtico",
      "Vaporizador de leche profesional para capuchinos perfectos",
      "Depósito de agua extraíble de 1.5L para múltiples preparaciones",
      "Bandeja calienta tazas para servir a la temperatura ideal",
    ],
  },
  {
    title: "¡Supera Tus Límites!",
    description:
      "¡Despega hacia nuevos récords con las zapatillas Running Pro Air! Diseñadas para corredores que buscan rendimiento sin comprometer la comodidad. Su revolucionaria suela con tecnología de amortiguación adaptativa responde a cada pisada, proporcionando el equilibrio perfecto entre impulso y protección. La parte superior transpirable mantiene tus pies frescos mientras que el sistema de soporte dinámico estabiliza tu pisada en cualquier terreno. Ya sea que estés entrenando para tu primera carrera o buscando mejorar tu marca personal, las Running Pro Air te darán la ventaja que necesitas.",
    bullets: [
      "Tecnología de amortiguación adaptativa para máxima protección",
      "Sistema de soporte dinámico que previene lesiones",
      "Material transpirable que mantiene tus pies frescos",
      "Diseño ultraligero para un rendimiento óptimo",
    ],
  },
];

async function main() {
  console.log(`Iniciando creación de usuario de prueba: ${DEMO_USER.email}`);

  // Verifica si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: DEMO_USER.email },
  });

  if (existingUser) {
    console.log(
      "El usuario de prueba ya existe. Eliminándolo para recrearlo..."
    );
    await prisma.user.delete({
      where: { id: existingUser.id },
    });
  }

  // Crear usuario de prueba
  const hashedPassword = await hash(DEMO_USER.password, 10);

  const user = await prisma.user.create({
    data: {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      password: hashedPassword,
      // Si es un usuario Pro, agregar datos de suscripción
      stripeCustomerId: DEMO_USER.isPro
        ? `cus_demo_${uuidv4().substring(0, 8)}`
        : null,
      stripeSubscriptionId: DEMO_USER.isPro
        ? `sub_demo_${uuidv4().substring(0, 8)}`
        : null,
      stripePriceId: DEMO_USER.isPro ? "price_demo_pro" : null,
      stripeCurrentPeriodEnd: DEMO_USER.isPro
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null, // 30 días en el futuro
    },
  });

  console.log(`Usuario creado con ID: ${user.id}`);

  // Crear productos de prueba
  for (const [index, demoProduct] of DEMO_PRODUCTS.entries()) {
    const product = await prisma.product.create({
      data: {
        name: demoProduct.name,
        category: demoProduct.category,
        keywords: demoProduct.keywords, // Esto funcionará si 'keywords' es de tipo Json en tu schema
        tone: demoProduct.tone,
        userId: user.id,
      },
    });

    console.log(`Producto creado: ${product.name}`);

    // Crear descripción asociada al producto
    const demoDescription = DEMO_DESCRIPTIONS[index];

    await prisma.description.create({
      data: {
        content: JSON.stringify(demoDescription),
        productId: product.id,
        userId: user.id,
      },
    });

    console.log(`Descripción creada para: ${product.name}`);
  }

  console.log("\n=====================================================");
  console.log("| USUARIO DE PRUEBA CREADO EXITOSAMENTE            |");
  console.log("=====================================================");
  console.log(`| Email:    ${DEMO_USER.email}`);
  console.log(`| Password: ${DEMO_USER.password}`);
  console.log(`| Nombre:   ${DEMO_USER.name}`);
  console.log(`| Plan:     ${DEMO_USER.isPro ? "Pro" : "Básico"}`);
  console.log("=====================================================");
  console.log("| Se han creado 3 productos con sus descripciones   |");
  console.log("=====================================================\n");
}

main()
  .catch((e) => {
    console.error("Error creando el usuario de prueba:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
