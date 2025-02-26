// Run scan immediately when popup opens
document.addEventListener('DOMContentLoaded', scanPage);


// value normalizer
function normalizeValue(v1, v2, v3) {
    const answer = Math.round((1.2*(Number(v1))+Number(v2)+Number(v3))/3);

    const vector_embeddig = [92, 93, 94, 95, 96, 97, 98];

    if (answer > 100) {
        const scaledIndex = Math.floor(Math.random() * vector_embeddig.length);
        const scaled_value = vector_embeddig[scaledIndex];
        return scaled_value;
    }

    return answer;
}

// Add this at the top of popup.js, after your existing event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add the styles for both progress bar and loading animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes progress {
            0% {
                stroke-dasharray: 0, 100;
            }
        }
        .animate-progress {
            animation: progress 1s ease-out forwards;
            transform: rotate(-180deg);
            transform-origin: 50% 50%;
        }

        .loading-maple {
            width: 200px;
            height: 200px;
            background-image: url('media/maple.png');
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            margin: 40px auto;
            animation: spinY 2s infinite linear;
        }

        @keyframes spinY {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -40%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translate(-50%, -50%); }
            to { opacity: 0; transform: translate(-50%, -60%); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-fadeOut {
            animation: fadeOut 0.3s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
});

const BACKEND_URL = 'http://localhost:5000/api/cart';

function scanPage() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="text-center bg-white p-8 rounded-3xl shadow-md">
            <div class="loading-maple"></div>
            <p class="text-gray-500 mt-6 text-lg">Canifying your experience...</p>
        </div>
    `;

    console.log('Starting automatic scan...');
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs || !tabs[0]) {
            console.error('No active tab found');
            resultsDiv.innerHTML = '<p class="text-red-500">Error: Cannot access current tab</p>';
            return;
        }

        const currentTab = tabs[0];
        console.log('Current tab:', currentTab);

        // First, inject the content script
        chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['extract.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('Script injection failed:', chrome.runtime.lastError);
                resultsDiv.innerHTML = '<p class="text-red-500">Error: Could not inject scanner</p>';
                return;
            }

            console.log('Content script injected, sending analyze message...');
            
            // Now send the message to the content script
            setTimeout(() => {  // Give the script a moment to initialize
                try {
                    chrome.tabs.sendMessage(
                        currentTab.id, 
                        {action: 'analyze'}, 
                        function(response) {
                            console.log('Raw page data:', response);
                            
                            if (chrome.runtime.lastError) {
                                console.error('Runtime error:', chrome.runtime.lastError);
                                resultsDiv.innerHTML = `
                                    <p class="text-red-500">Error: ${chrome.runtime.lastError.message}</p>
                                    <p class="text-sm text-gray-500">Try refreshing the page</p>
                                `;
                                return;
                            }

                            // Send data to backend
                            fetch(BACKEND_URL, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                mode: 'cors',
                                body: JSON.stringify(response)
                            })
                            .then(async response => {
                                console.log('Response status:', response.status);
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                const text = await response.text();
                                console.log('Response text:', text);
                                return text ? JSON.parse(text) : {};
                            })
                            .then(data => {
                                console.log('Backend response:', data);

                                if (data && data.status === 'success') {
                                    const responseMatrix = data.analysis;
                                    
                                    // Make the results div scrollable
                                    resultsDiv.style.height = '400px';
                                    resultsDiv.style.maxHeight = '400px';
                                    resultsDiv.className = 'overflow-y-auto p-4';
                                    
                                    let productListHtml;                               
                                    // Check if response matrix exists and has items
                                    if (!responseMatrix || responseMatrix.length === 0) {
                                        productListHtml = `
                                            <div class="text-center py-8 space-y-4">
                                                <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                                    <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                    </svg>
                                                </div>
                                                <h3 class="text-lg font-semibold text-red-800">Empty Cart Detected</h3>
                                                <p class="text-sm text-red-400 max-w-xs mx-auto">
                                                    We couldn't find any products in your shopping cart. Try adding items first.
                                                </p>
                                            </div>
                                        `;
                                    } else {
                                        productListHtml = `
                                            <div class="space-y-4">
                                                ${responseMatrix.map((row, index) => `
                                                    <div class="group relative bg-white p-4 rounded-2xl shadow-sm hover:shadow-md smooth-transition flex flex-col min-h-[72]">
                                                        <!-- Top Section with title and circle -->
                                                        <div class="flex items-start justify-between mb-4">
                                                            <div class="pr-4 flex-1">
                                                                <span class="text-xs font-medium text-gray-400">Item ${index + 1}</span>
                                                                <h3 class="text-base font-semibold text-gray-800 mt-1">${row[0]}</h3>
                                                            </div>
                                                            <div class="w-20 h-20 ml-4 relative">
                                                                <svg class="w-full h-full" viewBox="0 0 36 36">
                                                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                                                          fill="none" 
                                                                          stroke="#eee" 
                                                                          stroke-width="3"/>
                                                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                          fill="none" 
                                                                          stroke="#dc2626" 
                                                                          stroke-width="3" 
                                                                          stroke-dasharray="${normalizeValue(row[1], row[2], row[3])}, 100"
                                                                          class="animate-progress"/>
                                                                </svg>
                                                                <div class="absolute inset-0 flex items-center justify-center">
                                                                    <span class="text-sm font-semibold text-gray-700">
                                                                        ${normalizeValue(row[1], row[2], row[3])}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <!-- Quote Section -->
                                                        <div class="text-sm text-gray-500 italic flex-grow mb-4">
                                                            "${row[4]}"
                                                        </div>

                                                        <!-- Conditional rendering based on score -->
                                                        ${normalizeValue(row[1], row[2], row[3]) >= 53 ? `
                                                            <!-- High score version (≥53%) -->
                                                            <div class="flex flex-col items-end mb-3">
                                                                <button class="meme-coin-btn bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md hover:bg-green-400 transition-colors cursor-pointer">
                                                                    ${(normalizeValue(row[1], row[2], row[3]) / 1064.38).toFixed(3)} NEAR COINS
                                                                </button>
                                                            </div>

                                                            <!-- Bottom Border with conversion info -->
                                                            <div class="border-t border-gray-100 pt-4">
                                                                <div class="text-[8px] text-gray-900 italic mt-0.5 flex items-center">
                                                                    <img src="media/near.png" alt="NEAR" class="w-3 h-3 mr-1"/>
                                                                    ${(normalizeValue(row[1], row[2], row[3]) / 1064.38).toFixed(3)} NEAR COIN = CA$${(4.72*(normalizeValue(row[1], row[2], row[3]) / 1064.38)).toFixed(3)}
                                                                </div>
                                                            </div>
                                                        ` : `
                                                            <!-- Low score version (<53%) -->
                                                            <div class="flex flex-col items-end mb-3">
                                                                <button class="meme-coin-btn bg-yellow-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md hover:bg-yellow-400 transition-colors cursor-pointer">
                                                                    <a href="${row[5]}" class="underline hover:text-gray-100" target="_blank">Canadian Alternatives</a>
                                                                </button>
                                                            </div>
                                                        `}
                                                    </div>
                                                `).join('')}
                                            </div>
                                        `;
                                    }

                                    resultsDiv.innerHTML = productListHtml;
                                    const buttons = document.querySelectorAll('.meme-coin-btn');
                                    buttons.forEach(button => {
                                        button.addEventListener('click', (e) => {
                                            if (button.classList.contains('bg-green-500')) {
                                                const nearValue = button.textContent.split(' ')[0];
                                                createSuccessPopup(nearValue);
                                            }
                                        });
                                    });
                                } else {
                                    // Handle unexpected response structure or failure
                                    resultsDiv.innerHTML = '<p class="text-red-500">Error processing the data. Response is invalid.</p>';
                                }
                            })
                            .catch(error => {
                                console.error('Error processing backend response:', error);
                                resultsDiv.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
                            });
                        }
                    );
                } catch (err) {
                    console.error('Error sending message:', err);
                    resultsDiv.innerHTML = '<p class="text-red-500">Error communicating with page</p>';
                }
            }, 100);  // Small delay to ensure script is ready
        });
    });
}

// Keep just the success popup function
function createSuccessPopup(nearValue) {
    const popup = document.createElement('div');
    popup.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-6 z-50 animate-fadeIn transition-opacity duration-500 opacity-100';
    popup.innerHTML = `
        <div class="text-center">
            <div class="text-green-500 font-bold text-lg mb-2">Congrats!</div>
            <div class="text-gray-700">Your Wallet has been credited!</div>
        </div>
    `;
    document.body.appendChild(popup);

    // Fade out and remove popup after 1 second
    setTimeout(() => {
        popup.classList.add('animate-fadeOut');
        setTimeout(() => {
            if (popup && popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 300); // Match the animation duration
    }, 1000);
}
