const express = require('express')
const app = express()
require('dotenv').config()
const stripe = require('stripe')('sk_test_51IfOlKLIKYaeJCUwdK9F4R7ly7GxqCNmMk0tyytRdDEL33ZO3tzuyLCZz1aeiv5XOqDpszXpBnCXF8KQq26MW0IW004MLFhlRz')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');
uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

//middleware
app.use(express.json())
app.use(cors())

//routes
app.get('/', (req, res) => {
  res.send('Cela fonctionne !')
});

app.post('/payment', (req, res) => {
  const { cart, token} = req.body;

  const array = [];
  for (let i = 0; i < cart.line_items.length; i++){
    array.push(cart.line_items[i].name + ': x'+ cart.line_items[i].quantity)
  }

  return stripe.customers.create({
    email : token.email,
    source: token.id
  })
  .then(customer => {
    stripe.charges.create({
      amount: cart.subtotal.raw * 100,
      currency: 'EUR',
      customer: customer.id,
      receipt_email: token.email,
      description: array.join(' ; '),
      shipping: {
        name: token.card.name,
        address: {
          line1: token.card.address_line1,
        }
      },
    })
    .then(result => res.status(200).json(result))
  })
  .catch(err => console.log(err))
})

//listen
app.listen(process.env.PORT || 8282, () => {
  console.log('Server is listening on port 8282')
})