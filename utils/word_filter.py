import nltk
from nltk import pos_tag
from nltk.corpus import stopwords

# NLTK 데이터 경로를 명확히 지정
nltk.data.path.append("/Users/kimjeongmin/nltk_data")

# 필요한 리소스 다운로드 (이미 있으면 무시됨)
nltk.download('averaged_perceptron_tagger', download_dir="/Users/kimjeongmin/nltk_data")
nltk.download('stopwords', download_dir="/Users/kimjeongmin/nltk_data")

important_pos = {'NN', 'NNS', 'VB', 'VBD', 'VBG', 'JJ'}
stop_words = set(stopwords.words('english'))

def filter_important_words(word_list):
    tagged = pos_tag(word_list)
    return [
        word.lower()
        for word, tag in tagged
        if tag in important_pos
        and word.lower() not in stop_words
        and word.isalpha()
        and tag not in {'NNP', 'NNPS'}  # 고유명사 제거
    ]
