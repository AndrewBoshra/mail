
// Use buttons to toggle between views
document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
document.querySelector('#compose').addEventListener('click', () => compose_email());
document.querySelector('#compose-submit').addEventListener('click', compose_submit);

// By default, load the inbox
load_mailbox('inbox');


//==================================================================================
//============================== UI Functions ======================================
//==================================================================================

function show_view(newView) {
  const views = [
    '#email-view',
    '#emails-view',
    '#compose-view'
  ];

  views.forEach(view => {
    document.querySelector(view).style.display = 'none';
  });
  document.querySelector(newView).style.display = 'block';
}


function highlightSelected(selected) {
  const navlist = document.querySelectorAll('.nav-list > .nav-item');
  navlist.forEach(element => element.classList.remove('selected'));
  switch (selected) {
    case 'compose':
      document.getElementById('compose').classList.add('selected');
      break;
    case 'inbox':
      document.getElementById('inbox').classList.add('selected');
      break;
    case 'sent':
      document.getElementById('sent').classList.add('selected');
      break;
    case 'archive':
      document.getElementById('archived').classList.add('selected');
      break;

  }
}


function compose_email(recipient = '', subject = '', body = '') {

  // Show compose view and hide other views
  show_view('#compose-view');
  highlightSelected('compose');
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipient;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;
  document.getElementById('success').style.display = 'none';
  document.getElementById('error').style.display = 'none';

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  show_view('#emails-view');
  highlightSelected(mailbox);
  fetch('emails/' + mailbox).then(res => res.json()).then(
    emails => {
      ReactDOM.render(
        <div>
          <h2>{mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h2>
          <div className="margin">
            {emails.map(email => <Email email={email} key={email.id} onClick={() => load_email(email.id, mailbox)} />)}
          </div>
        </div>
        , document.querySelector('#emails-view'));
    })

}

function load_email(id, mailbox) {
  show_view('#email-view');
  //mark as read
  fetch('emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({ read: true })
  });

  fetch('emails/' + id).then(res => res.json())
    .then(email => {
      ReactDOM.render(
        <EmailDetails email={email}>
          {actions(mailbox, email)}
        </EmailDetails>
        , document.getElementById('email-view')
      )
    })
}


//==================================================================================
//==============================React components====================================
//==================================================================================


function Email(props) {

  let style = { backgroundColor: props.email.read ? 'whitesmoke' : 'white' };
  return <div className="flex border padding clickable" style={style} onClick={props.onClick} >
    <span className="bold large">{'> ' + props.email.sender}</span>
    <span className="bold large">{props.email.subject}</span>
    <span className="lighter">{props.email.timestamp}</span>
  </div>
}
function EmailDetails(props) {
  return <div>
    <p className="bold large">{'From: ' + props.email.sender}</p>
    <p className="bold large">{'To: ' + props.email.recipients}</p>
    <p className="bold large">{'Subject: ' + props.email.subject}</p>
    <hr className="margin" />
    <p className="large">{props.email.body}</p>
    {props.children}
    <p className="lighter">Marked as {props.email.read ? 'read' : 'unread'}</p>
    <p className="lighter">{props.email.timestamp}</p>
  </div>
}


function actions(mailbox, email) {
  let actionsarray = []
  switch (mailbox) {
    case 'inbox':
      actionsarray.push(<a key={0} onClick={() => archive_email(email.id, true)}>Add to Archive</a>);
      actionsarray.push(<button key={1} className="btn margin" onClick={() => reply(email)}> Reply </button>);
      break;
    case 'archive':
      actionsarray.push(<a key={0} onClick={() => archive_email(email.id, false)}>Remove from Archive</a>);
      break;

  }
  return actionsarray;
}

function reply(email) {
  let body = 'On ' + email.timestamp + '   ' + email.sender + ' wrote:\n' + email.body;
  compose_email(email.sender, email.subject.startsWith("RE: ") ? email.subject : "RE: " + email.subject, body);
  document.getElementById('compose-recipients').disabled = true;
  document.getElementById('compose-subject').disabled = true;
}
//==================================================================================
//==============================Helper Functions====================================
//==================================================================================

function show_error_mes(message) {
  const errordiv = document.getElementById('error');
  errordiv.style.display = 'block';
  errordiv.innerHTML = message;
}

function show_success_mes(message) {
  const successdiv = document.getElementById('success');
  successdiv.style.display = 'block';
  successdiv.innerHTML = message;
}

function compose_submit() {
  document.getElementById('success').style.display = 'none';
  document.getElementById('error').style.display = 'none';
  fetch('emails',
    {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        body: document.querySelector('#compose-body').value,
        subject: document.querySelector('#compose-subject').value,
      })
    }).then(res => res.json())
    .then(data => {
      if (data.error)
        show_error_mes(data.error)
      if (data.message) {
        show_success_mes(data.message);
        show_view('#emails-view');
        load_mailbox('sent');
      }
    })

}

function archive_email(id, archive) {
  fetch('emails/' + id, { method: 'PUT', body: JSON.stringify({ archived: archive }) })
    .then(res => { if (res.status == 204) load_mailbox('inbox') });

}
