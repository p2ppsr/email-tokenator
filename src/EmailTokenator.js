const PushDropTokenator = require('pushdrop-tokenator')
const BabbageSDK = require('@babbage/wrapped-sdk')
const pushdrop = require('pushdrop')

const STANDARD_EMAIL_MESSAGEBOX = 'email_inbox'
const STANDARD_EMAIL_BASKET = 'email'
const EMAIL_PROTOCOL_ID = 'email'
const EMAIL_KEY_ID = 1
const STANDARD_TOKEN_VALUE = 1
const EMAIL_PROTO_ADDR = '1XKdoVfVTrtNu243T44sNFVEpeTmeYitK'

/**
 * Extends the Tokenator class to enable sending email messages
 * @param {object} obj All parameters are given in an object.
 * @param {String} [obj.peerServHost] The PeerServ host you want to connect to.
 * @param {String} [obj.clientPrivateKey] A private key to use for mutual authentication with Authrite. (Optional - Defaults to Babbage signing strategy).
 */
class EmailTokenator extends PushDropTokenator {
  constructor ({
    peerServHost = 'https://staging-peerserv.babbage.systems',
    clientPrivateKey
  } = {}) {
    super({
      peerServHost,
      clientPrivateKey,
      defaultTokenValue: STANDARD_TOKEN_VALUE,
      protocolID: EMAIL_PROTOCOL_ID,
      protocolKeyID: EMAIL_KEY_ID,
      protocolBasketName: STANDARD_EMAIL_BASKET,
      protocolMessageBox: STANDARD_EMAIL_MESSAGEBOX,
      protocolAddress: EMAIL_PROTO_ADDR
    })
  }

  /**
   * Creates an email token to send in a message to PeerServ
   * @param {Object} message The email message to send
   * @param {String} message.recipient The recipient of this email
   * @param {String} message.subject The subject of the email given as a public identity key
   * @param {String} message.body The body of the email message
   */
  async sendEmail (message) {
    const emailToken = {
      recipient: message.recipient,
      messageBox: STANDARD_EMAIL_MESSAGEBOX,
      body: {
        subject: message.subject,
        body: message.body,
        dateSent: new Date()
      }
    }
    return await this.sendPushDropToken(emailToken, ['email_outgoing'])
  }

  /**
   * Wrapper function that lists incoming emails from PeerServ, and submits them into a private basket
   * @returns {Array} of incoming emails from PeerServ
   */
  async checkEmail () {
    // Use BabbageSDK or private key for signing strategy
    return await this.receivePushDropTokens()
  }

  /**
   * Reads email messages from a private basket according to the standard protocol
   * @param {Boolean} - If provided, lists only outgoing email
   * @returns {Array} An array of email messages
   */
  async readEmail (outgoing) {
    let tags
    if (outgoing) {
      tags = ['email_outgoing']
    }
    const emailFromBasket = await BabbageSDK.getTransactionOutputs({
      // The name of the basket where the tokens are kept
      basket: this.protocolBasketName,
      // Only get tokens that are active on the list, not already spent
      spendable: true,
      includeEnvelope: true,
      tags
    })

    // Decrypt the user's email
    const decryptedEmail = await Promise
      .all(emailFromBasket.map(async email => {
        try {
          const token = {
            ...email.envelope,
            lockingScript: email.outputScript,
            txid: email.txid,
            outputIndex: email.vout,
            satoshis: email.amount
          }

          // Get custom instructions if provided
          let counterparty = 'self'
          if (email.customInstructions) {
            token.customInstructions = JSON.parse(email.customInstructions)
            counterparty = token.customInstructions.recipient
          }

          const decodedEmail = pushdrop.decode({ script: email.outputScript })
          const encryptedEmail = decodedEmail.fields[1]
          const decryptedEmail = await BabbageSDK.decrypt({
            ciphertext: Buffer.from(encryptedEmail, 'hex'),
            protocolID: this.protocolID,
            keyID: this.protocolKeyID,
            counterparty,
            returnType: 'string'
          })
          // Now we can return the decrypted version of the email, along
          // with some information about the token.
          const parsedMessage = JSON.parse(decryptedEmail)
          const parsedEmail = parsedMessage.body
          console.log(decryptedEmail)
          return {
            token,
            // Finally, we include the email that we've just decrypted, for
            // showing in the email list
            subject: parsedEmail.subject,
            body: parsedEmail.body,
            dateSent: parsedEmail.dateSent
          }
        } catch (e) {
        // In case there are any errors, we'll handle them gracefully.
          console.error('Error decrypting email:', e)
          return {
            ...email,
            note: '[error] Unable to decrypt email!'
          }
        }
      }))
    // We reverse the list, so the newest emails show up at the top
    decryptedEmail.reverse()
    return decryptedEmail
  }

  /**
   * Removes an email token from a user's private basket
   * @param {Object} email the email object
   * @param {Object} email.token the email token to delete
   */
  async deleteEmail (email) {
    try {
      // If the email token belongs to the current user, pushdrop.redeem will work to unbasket the output.
      // If it is an email token you can read, but not spend, unbasketOutput would be the function to use.
      await this.redeemPushDropToken(email.token)
      // await BabbageSDK.unbasketOutput({
      //   txid: email.token.txid,
      //   basket: this.protocolBasketName,
      //   vout: 0
      // })
    } catch (error) {
      console.error('Error deleting email:', error)
    }
  }
}
module.exports = EmailTokenator
