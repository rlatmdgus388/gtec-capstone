import nltk

# 명시적으로 사용자 다운로드 경로 설정
NLTK_DATA_PATH = "/Users/kimjeongmin/nltk_data"
nltk.data.path.append(NLTK_DATA_PATH)

# 필수 리소스 다운로드 (이미 있으면 skip됨)
nltk.download('punkt', download_dir=NLTK_DATA_PATH)
nltk.download('averaged_perceptron_tagger', download_dir=NLTK_DATA_PATH)
nltk.download('stopwords', download_dir=NLTK_DATA_PATH)
