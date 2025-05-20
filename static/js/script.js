document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const inputText = document.getElementById('input-text');
    const analyzeButton = document.getElementById('analyze-button');
    const clearButton = document.getElementById('clear-button');
    const resultSection = document.getElementById('result-section');
    const spinner = document.getElementById('spinner');
    const sentimentEmoji = document.getElementById('sentiment-emoji');
    const sentimentLabel = document.getElementById('sentiment-label');
    const sentimentScore = document.getElementById('sentiment-score');
    const languageInfo = document.getElementById('language-info');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    // Handle enter key in textarea
    inputText.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            analyzeButton.click();
        }
    });

    // Handle analyze button click
    analyzeButton.addEventListener('click', function() {
        const text = inputText.value.trim();
        
        if (!text) {
            showError('Please enter some text to analyze.');
            return;
        }
        
        analyzeSentiment(text);
    });

    // Handle clear button click
    clearButton.addEventListener('click', function() {
        inputText.value = '';
        resultSection.classList.add('hidden');
        errorMessage.classList.add('hidden');
        inputText.focus();
    });

    // Function to analyze sentiment
    function analyzeSentiment(text) {
        // Show spinner and hide any previous errors
        resultSection.classList.remove('hidden');
        spinner.classList.remove('hidden');
        sentimentEmoji.textContent = '';
        sentimentLabel.textContent = '';
        sentimentScore.textContent = '';
        languageInfo.textContent = '';
        errorMessage.classList.add('hidden');
        
        // Call API
        fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'An error occurred during analysis.');
                });
            }
            return response.json();
        })
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            showError(error.message);
            resultSection.classList.add('hidden');
        })
        .finally(() => {
            spinner.classList.add('hidden');
        });
    }

    // Function to display results
    function displayResults(data) {
        // Get sentiment class and emoji
        const sentimentClass = getSentimentClass(data.label);
        const emoji = getSentimentEmoji(data.label);
        
        // Display results
        sentimentEmoji.textContent = emoji;
        sentimentLabel.textContent = data.label;
        sentimentLabel.className = 'sentiment-label ' + sentimentClass;
        
        // Format and display score as percentage
        const scorePercent = Math.round(data.score * 100);
        sentimentScore.textContent = `Confidence: ${scorePercent}%`;
        
        // Apply result-specific styling to the result section
        resultSection.className = 'result-section'; // Reset classes first
        resultSection.classList.remove('hidden');
        resultSection.classList.add(sentimentClass + '-result');
        
        // Display detected language
        if (data.language) {
            let languageDisplay = '';
            
            if (data.language === 'short-text') {
                languageDisplay = 'Text too short for reliable language detection';
            } else if (data.language === 'undetermined' || data.language === 'error') {
                languageDisplay = 'Language could not be determined';
            } else {
                const languageName = getLanguageName(data.language);
                languageDisplay = `Detected language: ${languageName} (${data.language})`;
            }
            
            languageInfo.innerHTML = `${languageDisplay}<br><br><span class="language-note">This model supports <a href="https://huggingface.co/tabularisai/multilingual-sentiment-analysis" target="_blank" rel="noopener">multiple languages</a></span>`;
        }
    }

    // Function to show error message
    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    // Function to get sentiment class for styling
    function getSentimentClass(label) {
        switch (label) {
            case 'Very Positive':
                return 'very-positive';
            case 'Positive':
                return 'positive';
            case 'Neutral':
                return 'neutral';
            case 'Negative':
                return 'negative';
            case 'Very Negative':
                return 'very-negative';
            default:
                return '';
        }
    }

    // Function to get sentiment emoji
    function getSentimentEmoji(label) {
        switch (label) {
            case 'Very Positive':
                return '😄';
            case 'Positive':
                return '🙂';
            case 'Neutral':
                return '😐';
            case 'Negative':
                return '🙁';
            case 'Very Negative':
                return '😞';
            default:
                return '';
        }
    }

    // Function to get language name from code
    function getLanguageName(code) {
        // Language mapping based on the model card: https://huggingface.co/tabularisai/multilingual-sentiment-analysis
        const languages = {
            // Major languages explicitly listed in the model card
            'en': 'English',
            'zh': 'Chinese (中文)',
            'zh-cn': 'Simplified Chinese (简体中文)',
            'zh-tw': 'Traditional Chinese (繁體中文)',
            'es': 'Spanish (Español)',
            'hi': 'Hindi (हिन्दी)',
            'ar': 'Arabic (العربية)',
            'bn': 'Bengali (বাংলা)',
            'pt': 'Portuguese (Português)',
            'ru': 'Russian (Русский)',
            'ja': 'Japanese (日本語)',
            'de': 'German (Deutsch)', 
            'ms': 'Malay (Bahasa Melayu)',
            'te': 'Telugu (తెలుగు)',
            'vi': 'Vietnamese (Tiếng Việt)',
            'ko': 'Korean (한국어)',
            'fr': 'French (Français)',
            'tr': 'Turkish (Türkçe)',
            'it': 'Italian (Italiano)',
            'pl': 'Polish (Polski)',
            'uk': 'Ukrainian (Українська)',
            'tl': 'Tagalog (Filipino)',
            'nl': 'Dutch (Nederlands)',
            'gsw': 'Swiss German (Schweizerdeutsch)',
            
            // Additional common languages that may be detected
            'id': 'Indonesian (Bahasa Indonesia)',
            'th': 'Thai (ไทย)',
            'fa': 'Persian (فارسی)',
            'ur': 'Urdu (اردو)',
            'ta': 'Tamil (தமிழ்)',
            'mr': 'Marathi (मराठी)',
            'gu': 'Gujarati (ગુજરાતી)',
            'kn': 'Kannada (ಕನ್ನಡ)',
            'ml': 'Malayalam (മലയാളം)',
            'pa': 'Punjabi (ਪੰਜਾਬੀ)',
            'sv': 'Swedish (Svenska)',
            'da': 'Danish (Dansk)',
            'fi': 'Finnish (Suomi)',
            'no': 'Norwegian (Norsk)',
            'cs': 'Czech (Čeština)',
            'el': 'Greek (Ελληνικά)',
            'hu': 'Hungarian (Magyar)',
            'ro': 'Romanian (Română)',
            'sk': 'Slovak (Slovenčina)',
            'bg': 'Bulgarian (Български)',
            'sr': 'Serbian (Српски)',
            'hr': 'Croatian (Hrvatski)',
            'sl': 'Slovenian (Slovenščina)',
            'et': 'Estonian (Eesti)',
            'lt': 'Lithuanian (Lietuvių)',
            'lv': 'Latvian (Latviešu)',
            'ca': 'Catalan (Català)',
            'he': 'Hebrew (עברית)',
            'af': 'Afrikaans',
            'sw': 'Swahili (Kiswahili)'
        };
        
        return languages[code] || code;
    }
});
