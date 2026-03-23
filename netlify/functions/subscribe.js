exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { name, email } = JSON.parse(event.body);

    if (!name || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nome e email são obrigatórios.' })
      };
    }

    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
    const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;

    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`
      },
      body: JSON.stringify({
        email: email,
        fields: { name: name },
        groups: [MAILERLITE_GROUP_ID]
      })
    });

    const data = await response.json();

    if (response.ok || response.status === 409) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    } else {
      console.error('MailerLite error:', data);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erro ao registar. Tenta novamente.' })
      };
    }

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno. Tenta novamente.' })
    };
  }
};
