import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from data import GitData

class GitRAG:
    def __init__(self, data_filename="processed_data.pkl"):
        self.data = GitData()
        self.data.load_processed_data(data_filename)

    def get_most_similar_issues(self, query, top_n=3):
        """Finds the most similar Git issues to the user's query."""
        query_vector = self.data.vectorizer.transform([query])
        similarity_scores = cosine_similarity(query_vector, self.data.tfidf_matrix)
        top_indices = similarity_scores.argsort()[0][-top_n:][::-1] 
        return self.data.df.iloc[top_indices]

    def retrieve_relevant_info(self, query, top_n=3):
        """Retrieves and formats relevant information from similar issues."""
        similar_issues = self.get_most_similar_issues(query, top_n)
        context = ""
        for idx, row in similar_issues.iterrows():
            context += f"**Issue:** {row['Common Issue']}\n"
            context += f"**Solution:** {row['Solution']}\n\n"
        return context

# Example Usage (You'd likely call this from your API endpoint)
if __name__ == "__main__":
    rag = GitRAG()
    user_query = "How to fix git merge conflicts"
    context = rag.retrieve_relevant_info(user_query)
    print(context)