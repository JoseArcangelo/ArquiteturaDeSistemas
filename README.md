# notification-service

Serviço simples que expõe um endpoint POST /notify para simular envio de notificação ao usuário quando um pedido é realizado.

Endpoints:
- GET / -> health
- POST /notify -> body: { userId, orderId, message? }

Exemplo de request:

POST /notify
{
  "userId": "user-1",
  "orderId": "order-123",
  "message": "Compra realizada com sucesso"
}
