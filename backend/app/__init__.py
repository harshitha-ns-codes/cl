from flask import Flask
from flask_cors import CORS

from app.db import init_db
from app.api.routes import bp as routes_bp


def create_app():
    init_db()
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(routes_bp)
    return app
