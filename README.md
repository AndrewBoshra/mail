# Mail

A single-page email client — compose, send, read, archive and reply, with the inbox updating without a page reload.

## Stack

Django · Python · vanilla JavaScript (fetch API)

## Features

- Send mail to other registered users
- Inbox, sent and archive views rendered client-side
- Read, archive/unarchive and reply
- Django REST endpoints backing a JavaScript front end

## Running it

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Notes

Built as a CS50 Web Programming project.
