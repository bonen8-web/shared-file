from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        'status': 'success',
        'message': 'Render Test App is running!',
        'python_version': os.sys.version,
        'port': os.environ.get('PORT', '5000')
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running perfectly!'
    })

@app.route('/test')
def test():
    return jsonify({
        'test': 'passed',
        'endpoints': {
            'home': '/',
            'health': '/health',
            'test': '/test'
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
