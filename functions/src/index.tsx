import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as nodemailer from 'nodemailer'

admin.initializeApp()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_SERVICE_ACCOUNT_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

export const onDataRequestCreated = functions.firestore
  .document('requests/{requestId}')
  .onCreate(async (snap, context) => {
    const request = snap.data()
    const pollId = request.pollId
    const requesterName = request.requesterName
    const requesterEmail = request.requesterEmail

    // Get poll details
    const pollDoc = await admin.firestore().collection('polls').doc(pollId).get()
    const poll = pollDoc.data()
    const pollOwnerUid = poll?.ownerUid

    // Get poll owner email
    const ownerDoc = await admin.firestore().collection('users').doc(pollOwnerUid).get()
    const owner = ownerDoc.data()
    const ownerEmail = owner?.email

    if (!ownerEmail) return

    // Send email to poll owner
    const mailOptions = {
      from: process.env.GMAIL_SERVICE_ACCOUNT_EMAIL,
      to: ownerEmail,
      subject: `New Data Request for "${poll?.title}"`,
      html: `
        <h2>📊 New Data Request</h2>
        <p><strong>${requesterName}</strong> (${requesterEmail}) is requesting access to your poll data.</p>
        
        <h3>Poll: ${poll?.title}</h3>
        
        <div style="margin: 20px 0;">
          <p><strong>Requester:</strong> ${requesterName}</p>
          <p><strong>Email:</strong> ${requesterEmail}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/requests" style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #4ECDC4;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin-right: 10px;
          ">Review Request</a>
        </div>
        
        <p style="color: #999; font-size: 12px;">Sent from PollSquad</p>
      `
    }

    return transporter.sendMail(mailOptions)
  })

export const onRequestApproved = functions.firestore
  .document('requests/{requestId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data()
    const oldData = change.before.data()

    // Only send email if status changed to approved
    if (oldData.status !== 'approved' && newData.status === 'approved') {
      const requesterEmail = newData.requesterEmail
      const pollId = newData.pollId

      // Get poll details
      const pollDoc = await admin.firestore().collection('polls').doc(pollId).get()
      const poll = pollDoc.data()

      if (!requesterEmail || !poll) return

      // Build results summary from questions format
      let resultsHtml = ''
      if (poll.questions && Array.isArray(poll.questions)) {
        resultsHtml = poll.questions.map((q: any) => `
          <div style="margin: 10px 0;">
            <strong>${q.question}</strong>
            <ul>
              ${q.options.map((opt: any) => `
                <li>${opt.text}: ${opt.votesCount} votes</li>
              `).join('')}
            </ul>
          </div>
        `).join('')
      }

      const mailOptions = {
        from: process.env.GMAIL_SERVICE_ACCOUNT_EMAIL,
        to: requesterEmail,
        subject: `Your Data Request for "${poll.title}" was Approved!`,
        html: `
          <h2>📊 Request Approved!</h2>
          <p>Your request for poll data has been approved by the poll owner.</p>
          
          <h3>Poll: ${poll.title}</h3>
          
          <p><strong>Results Summary:</strong></p>
          ${resultsHtml}
          
          <div style="margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/results/${pollId}" style="
              display: inline-block;
              padding: 10px 20px;
              background-color: #FF6B6B;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            ">View Full Results</a>
          </div>
          
          <p style="color: #999; font-size: 12px;">Sent from PollSquad</p>
        `
      }

      return transporter.sendMail(mailOptions)
    }
  })
