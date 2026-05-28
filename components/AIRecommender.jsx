'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { chatRecommend } from '@/lib/api';
import useCart from '@/lib/cartStore';

// Quick-start prompts for inspiration
const QUICK_PROMPTS = [
  'I want to build lean muscle',
  'I need energy for intense gym sessions',
  'Help me lose fat while keeping muscle',
  'I want faster post-workout recovery',
  'Best supplement for beginners',
];

// Sparkle SVG icon
function SparkleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

// Product recommendation card displayed in chat
function RecommendedProductCard({ rec, onAddToCart }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(rec);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="ai-product-card">
      <div className="ai-product-card-image">
        {rec.image ? (
          <img src={rec.image} alt={rec.productName} />
        ) : (
          <div className="ai-product-card-placeholder">
            <SparkleIcon size={28} />
          </div>
        )}
      </div>
      <div className="ai-product-card-info">
        <div className="ai-product-card-name">{rec.productName}</div>
        {rec.reason && <div className="ai-product-card-reason">{rec.reason}</div>}
        <div className="ai-product-card-meta">
          {rec.flavor && rec.flavor !== 'Regular' && (
            <span className="ai-product-card-chip">{rec.flavor}</span>
          )}
          {rec.size && rec.size !== 'Standard' && (
            <span className="ai-product-card-chip">{rec.size}</span>
          )}
          {rec.price && (
            <span className="ai-product-card-price">₹{Number(rec.price).toLocaleString()}</span>
          )}
        </div>
        <div className="ai-product-card-actions">
          <Link
            href={`/product/${rec.productSlug}`}
            className="ai-card-btn-view"
          >
            View Product
          </Link>
          <button
            className={`ai-card-btn-cart${added ? ' added' : ''}`}
            onClick={handleAdd}
          >
            {added ? '✓ Added!' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Animated typing dots while AI is loading
function TypingIndicator() {
  return (
    <div className="ai-typing-indicator">
      <div className="ai-typing-avatar">
        <SparkleIcon size={14} />
      </div>
      <div className="ai-typing-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

// Main AIRecommender component
export default function AIRecommender() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.openCart);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Typewriter effect for AI messages
  const typewriterEffect = useCallback((text, onComplete) => {
    setIsTyping(true);
    setDisplayedText('');
    let i = 0;
    const speed = Math.max(12, Math.min(30, 2000 / text.length)); // adaptive speed
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = useCallback((rec) => {
    addItem({
      key: `${rec.productId}-${rec.flavor}-${rec.size}`,
      productId: rec.productId,
      name: rec.productName,
      flavorName: rec.flavor || 'Regular',
      weight: rec.size || '',
      price: rec.price || 0,
      image: rec.image || '',
      qty: 1,
    });
    openCart();
  }, [addItem, openCart]);

  const sendMessage = useCallback(async (query) => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    setInputValue('');
    setMessages(prev => [
      ...prev,
      { type: 'user', text: trimmed, id: Date.now() }
    ]);
    setIsLoading(true);

    try {
      const result = await chatRecommend(trimmed);

      if (!result.success) {
        setMessages(prev => [
          ...prev,
          {
            type: 'error',
            text: result.message || 'Something went wrong. Please try again.',
            id: Date.now()
          }
        ]);
        setIsLoading(false);
        return;
      }

      const { message, recommendations, suggestStackLab } = result.data;

      // Add AI message — typewriter starts after loading ends
      setIsLoading(false);
      const aiMsg = {
        type: 'ai',
        text: message,
        recommendations: recommendations || [],
        suggestStackLab: !!suggestStackLab,
        id: Date.now(),
        typingDone: false,
      };

      setMessages(prev => [...prev, aiMsg]);

      // Kick off typewriter for the last AI message
      typewriterEffect(message, () => {
        setMessages(prev =>
          prev.map(m => m.id === aiMsg.id ? { ...m, typingDone: true } : m)
        );
      });

    } catch {
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        {
          type: 'error',
          text: 'Unable to connect to the AI. Please check your connection and try again.',
          id: Date.now()
        }
      ]);
    }
  }, [isLoading, typewriterEffect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickPrompt = (prompt) => {
    sendMessage(prompt);
  };

  const lastAiMsgId = messages.filter(m => m.type === 'ai').slice(-1)[0]?.id;

  return (
    <>
      {/* ── Hero CTA Section ── */}
      <section className="ai-recommender-section" id="ai-advisor">
        <div className="container">
          <div className="ai-recommender-cta">
            <div className="ai-recommender-cta-badge">
              <SparkleIcon size={14} />
              AI-Powered
            </div>
            <h2 className="ai-recommender-cta-title">
              NOT SURE WHERE TO START?<br />
              <span className="ai-recommender-cta-highlight">LET AI CHOOSE FOR YOU.</span>
            </h2>
            <p className="ai-recommender-cta-subtitle">
              Describe your fitness goal and our AI advisor will instantly recommend the perfect supplements from our catalog — personalised just for you.
            </p>
            <button
              id="openAiAdvisorBtn"
              className="ai-recommender-cta-btn"
              onClick={() => setIsOpen(true)}
              aria-label="Open AI Product Advisor"
            >
              <SparkleIcon size={18} />
              Ask the AI Advisor
            </button>
            <p className="ai-recommender-cta-note">
              Free · No signup needed · Instant recommendations
            </p>
          </div>
        </div>
      </section>

      {/* ── Chatbot Modal ── */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="ai-chat-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Chat Panel */}
          <div className="ai-chat-panel" role="dialog" aria-label="AI Product Advisor" aria-modal="true">
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-chat-header-left">
                <div className="ai-chat-avatar">
                  <SparkleIcon size={16} />
                </div>
                <div>
                  <div className="ai-chat-header-title">AI Advisor</div>
                  <div className="ai-chat-header-sub">Powered by Gemini · Living Result</div>
                </div>
              </div>
              <button
                className="ai-chat-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close advisor"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="ai-chat-messages" id="aiChatMessages">
              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="ai-chat-welcome">
                  <div className="ai-welcome-avatar">
                    <SparkleIcon size={24} />
                  </div>
                  <div className="ai-welcome-title">Hey, I'm your AI supplement advisor!</div>
                  <div className="ai-welcome-text">
                    Tell me your fitness goal and I'll recommend the perfect products from our catalog, personalised for you.
                  </div>
                  {/* Quick prompts */}
                  <div className="ai-quick-prompts">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        className="ai-quick-prompt-btn"
                        onClick={() => handleQuickPrompt(p)}
                        disabled={isLoading}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {messages.map((msg) => {
                const isLastAi = msg.id === lastAiMsgId;

                if (msg.type === 'user') {
                  return (
                    <div key={msg.id} className="ai-msg-user">
                      <div className="ai-msg-user-bubble">{msg.text}</div>
                    </div>
                  );
                }

                if (msg.type === 'error') {
                  return (
                    <div key={msg.id} className="ai-msg-error">
                      <span>⚠️</span> {msg.text}
                    </div>
                  );
                }

                if (msg.type === 'ai') {
                  return (
                    <div key={msg.id} className="ai-msg-ai">
                      <div className="ai-msg-ai-avatar">
                        <SparkleIcon size={13} />
                      </div>
                      <div className="ai-msg-ai-content">
                        {/* Typewriter text for last message, plain text for others */}
                        <p className="ai-msg-ai-text">
                          {isLastAi && isTyping ? displayedText : msg.text}
                          {isLastAi && isTyping && (
                            <span className="ai-cursor">|</span>
                          )}
                        </p>

                        {/* Show product cards after typing finishes (or for old messages) */}
                        {(!isLastAi || msg.typingDone) && msg.recommendations?.length > 0 && (
                          <div className="ai-recommendations">
                            <div className="ai-recommendations-label">Recommended for you:</div>
                            <div className="ai-product-cards">
                              {msg.recommendations.map((rec) => (
                                <RecommendedProductCard
                                  key={rec.productId}
                                  rec={rec}
                                  onAddToCart={handleAddToCart}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Stack Lab suggestion */}
                        {(!isLastAi || msg.typingDone) && msg.suggestStackLab && (
                          <Link href="/stack-lab" className="ai-stacklab-banner">
                            <div className="ai-stacklab-banner-icon">🧪</div>
                            <div>
                              <div className="ai-stacklab-banner-title">
                                Want a custom combo stack?
                              </div>
                              <div className="ai-stacklab-banner-sub">
                                Visit Stack Lab™ — build your own exclusive supplement bundle with a special bundle discount. Only available here.
                              </div>
                            </div>
                            <div className="ai-stacklab-banner-arrow">→</div>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                }

                return null;
              })}

              {/* Loading indicator */}
              {isLoading && <TypingIndicator />}

              {/* Follow-up prompts after conversation */}
              {messages.length > 0 && !isLoading && (
                <div className="ai-followup-prompts">
                  {['Tell me more options', 'What about fat loss?', 'Visit Stack Lab™'].map((p) => (
                    <button
                      key={p}
                      className="ai-quick-prompt-btn"
                      onClick={() => p === 'Visit Stack Lab™' ? window.location.href = '/stack-lab' : handleQuickPrompt(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form className="ai-chat-input-area" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                id="aiChatInput"
                type="text"
                className="ai-chat-input"
                placeholder="Describe your fitness goal..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                maxLength={500}
                aria-label="Ask the AI advisor"
              />
              <button
                type="submit"
                className="ai-chat-send"
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
              >
                {isLoading ? (
                  <svg className="ai-send-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
