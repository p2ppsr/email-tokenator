# email-tokenator

A Tokenator for P2P Secure Email

## Overview
EmailTokenator is a specialized derived class of Tokenator that enables peer-to-peer secure email communication. With EmailTokenator, users can send and receive encrypted emails directly between each other over any PeerServ instance without the need for a central server or third-party intermediary. Mutual authentication is handled by Authrite, and monetization can be configured using PacketPay.

In this example, the message data is encrypted with the recipient as the counterparty and stored on-chain, but it can easily be modified to only store the hash of the message on-chain if so desired.

Developers can easily integrate this secure email functionality into their applications, providing users with a more private and secure way of communicating. EmailTokenator is a perfect example of how Tokenator's base-level class can be extended to build specialized tokens that solve real-world problems.

## Example Usage


```js
const EmailTokenator = require('email-tokenator')
const johnSmith = '022600d2ef37d123fdcac7d25d7a464ada7acd3fb65a0daf85412140ee20884311'

const init = async () => {
    // Create a new instance of the EmailTokenator class
    // Optionally configure a custom PeerServ host
    const tokenator = new EmailTokenator({
        peerServHost = 'https://staging-peerserv.babbage.systems'
    })
    // Send an Email token using Babbage
    const sendStatus = await tokenator.sendEmail({
        recipient: johnSmith,
        subject: 'Email Test',
        body: 'Hey John, this is a test of secure P2P email!'
    })

    // Receive incoming emails into your email basket
    const emailsReceived = await tokenator.checkEmail()

    // Decrypt the email stored in your private basket
    const decryptedEmails = await tokenator.readEmail()

    // Example of John reading the email
    console.log(decryptedEmails[0].subject) // --> 'Email Test'
    console.log(decryptedEmails[0].body)   // --> 'Hey John, this...'
}

init()
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [EmailTokenator](#emailtokenator)
    *   [Parameters](#parameters)
    *   [sendEmail](#sendemail)
        *   [Parameters](#parameters-1)
    *   [checkEmail](#checkemail)
    *   [readEmail](#reademail)
        *   [Parameters](#parameters-2)

### EmailTokenator

**Extends PushDropTokenator**

Extends the Tokenator class to enable sending email messages

#### Parameters

*   `obj` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** All parameters are given in an object. (optional, default `{}`)

    *   `obj.peerServHost` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** The PeerServ host you want to connect to. (optional, default `'https://staging-peerserv.babbage.systems'`)
    *   `obj.clientPrivateKey` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** A private key to use for mutual authentication with Authrite. (Optional - Defaults to Babbage signing strategy).

#### sendEmail

Creates a payment token to send in a message to PeerServ

##### Parameters

*   `message` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The email message to send

    *   `message.recipient` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The recipient of this email
    *   `message.subject` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The subject of the email
    *   `message.body` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The body of the email message

#### checkEmail

Wrapper function that lists incoming emails from PeerServ, and submits them into a private basket

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** of incoming emails from PeerServ

#### readEmail

Reads email messages from a private basket according to the standard protocol

##### Parameters

*   `obj` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** An object containing the messageIds

    *   `obj.messageIds` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** An array of Numbers indicating which email message(s) to read

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** An array of email messages
