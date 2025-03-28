from flask import Flask, render_template, request, jsonify
import numpy as np
from PIL import Image, ImageOps
import io
import tensorflow as tf
import base64

app = Flask(__name__)

# Load the model
model = tf.keras.models.load_model('model/mnist_model.h5')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    # Get the base64 encoded image data
    data = request.get_json()
    image_data = data['image'].split(',')[1]  # Remove data URL prefix
    
    # Convert to PIL Image
    img = Image.open(io.BytesIO(base64.b64decode(image_data)))
    
    # Preprocess the image
    img = ImageOps.invert(img.convert('L'))
    img = img.resize((28, 28))
    img_arr = np.array(img).reshape(1, 28, 28, 1).astype('float32') / 255
    
    # Make prediction
    prediction = model.predict(img_arr)
    digit = str(np.argmax(prediction))
    confidence = float(np.max(prediction))
    
    return jsonify({'digit': digit, 'confidence': confidence})

if __name__ == '__main__':
    app.run(debug=True)