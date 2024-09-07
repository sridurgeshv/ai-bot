import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
import pickle 

class GitData:
    def __init__(self, data_path="training_data/Training_data - Sheet1.csv"):
        self.data_path = data_path
        self.df = None
        self.vectorizer = TfidfVectorizer()
        self.label_encoder = LabelEncoder()
        self.tfidf_matrix = None 

        self.load_data()
        self.preprocess_data()

    def load_data(self):
        """Loads the CSV data into a pandas DataFrame."""
        self.df = pd.read_csv(self.data_path)

    def preprocess_data(self):
        """Applies preprocessing steps to the data."""
        self.df['text'] = self.df['Common Issue'] + ' ' + self.df['Solution'] # Combine for context
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['text'])

        # Fit the label encoder on the 'Category' column
        self.label_encoder.fit(self.df['Category'])
        
    def save_data(self, filename="processed_data.pkl"):
        """Saves the processed data and vectorizer."""
        with open(filename, "wb") as f:
            pickle.dump((self.df, self.vectorizer, self.label_encoder, self.tfidf_matrix), f)
    
    def load_processed_data(self, filename="processed_data.pkl"):
        """Loads pre-processed data and the trained vectorizer."""
        with open(filename, "rb") as f:
            self.df, self.vectorizer, self.label_encoder, self.tfidf_matrix = pickle.load(f)

# Example usage (You can put this in a separate script or in __init__.py)
if __name__ == "__main__":
    data = GitData()
    data.save_data()