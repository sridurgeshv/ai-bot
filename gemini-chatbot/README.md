Remember to have your gemini API key with you.

first in frontend 

enter `cd gemini-chatbot` in one terminal and in another terminal enter `cd 'gemini feedback'`.

Next in `gemini-chatbot` enter the command `npm install` for installing packages.

In `'gemini feedback'` enter the command ` .\venv\Scripts\activate`. only for `'gemini feedback'` directory.


In `'gemini feedback'` enter the command `pip install -r requirements.txt` for installing modules.


## To start 

Enter `npm start` in `'gemini-chatbot'` directory.
Enter `uvicorn main:app --reload` in `'gemini feedback'` directory to start the server.


for database, we run :
```bash
python init_db.py
```