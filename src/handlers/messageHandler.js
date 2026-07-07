const { getDatabase } = require('../database');
const { logger } = require('../utils/logger');

async function handleIncomingMessage(messageText, phoneNumber) {
  try {
    const db = getDatabase();
    
    // Store or update conversation
    db.run(
      `INSERT INTO conversations (phone_number) VALUES (?)
       ON CONFLICT(phone_number) DO UPDATE SET last_message_at = CURRENT_TIMESTAMP`,
      [phoneNumber],
      (err) => {
        if (err) logger.error(`Error updating conversation: ${err.message}`);
      }
    );

    // Get conversation ID
    db.get(
      'SELECT id FROM conversations WHERE phone_number = ?',
      [phoneNumber],
      (err, row) => {
        if (err) {
          logger.error(`Error getting conversation: ${err.message}`);
          return;
        }

        // Store message
        if (row) {
          db.run(
            `INSERT INTO messages (conversation_id, phone_number, message_text, direction)
             VALUES (?, ?, ?, 'inbound')`,
            [row.id, phoneNumber, messageText],
            (err) => {
              if (err) logger.error(`Error storing message: ${err.message}`);
            }
          );
        }
      }
    );

    // Process message and generate response
    const response = processMessage(messageText, phoneNumber);
    return response;
  } catch (error) {
    logger.error(`Error handling message: ${error.message}`);
    return 'Lo sentimos, ocurrió un error. Por favor intenta más tarde.';
  }
}

function processMessage(messageText, phoneNumber) {
  const message = messageText.toLowerCase().trim();

  // Handle different commands
  if (message === '/ayuda' || message === '/help') {
    return `Bienvenido al Bot de Marketing 👋\n\nComandos disponibles:\n/menu - Ver menú principal\n/ofertas - Ver ofertas especiales\n/contacto - Información de contacto\n/ayuda - Este mensaje`;
  }

  if (message === '/menu') {
    return `📋 MENÚ PRINCIPAL\n\n1️⃣ /ofertas - Ofertas especiales\n2️⃣ /productos - Catálogo de productos\n3️⃣ /contacto - Contáctanos\n4️⃣ /ayuda - Ayuda`;
  }

  if (message === '/ofertas') {
    return `🎉 OFERTAS ESPECIALES\n\n🔥 50% descuento en productos seleccionados\n⏰ Válido hasta fin de mes\n🚚 Envío gratis en compras mayores a $100\n\n¡Aprovecha ahora! Escribe /comprar para más info`;
  }

  if (message === '/productos') {
    return `📦 CATÁLOGO DE PRODUCTOS\n\nTenemos una amplia variedad de productos disponibles:\n\n✅ Electrónica\n✅ Ropa y accesorios\n✅ Hogar y jardín\n✅ Deportes\n\nEscribe /detalles para más información`;
  }

  if (message === '/contacto') {
    return `📞 CONTACTO\n\n📧 Email: info@marketingbot.com\n📱 WhatsApp: +1234567890\n🌐 Web: www.example.com\n🕐 Horario: Lunes a Viernes 9AM-6PM`;
  }

  if (message.startsWith('/')) {
    return `Comando no reconocido. Escribe /ayuda para ver los comandos disponibles.`;
  }

  // Default response for non-command messages
  return `Gracias por tu mensaje! 😊\n\nEscribe /ayuda para ver los comandos disponibles o /menu para ver nuestras opciones.`;
}

module.exports = {
  handleIncomingMessage,
  processMessage
};
