'use client';

import { useState } from 'react';
import { FAQS } from '../data/faqs';

const WHATSAPP_NUMBER = '5491176392303';

export default function FaqList() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [question, setQuestion] = useState('');

  const askOpen = openFaq === FAQS.length;

  const sendQuestion = () => {
    const text = question.trim();
    if (!text) return;
    const message = `Hola, vengo de la web de VeGroup.\nTengo una pregunta que no está en las FAQ:\n${text}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setQuestion('');
  };

  return (
            <div className="faq-list">
              {FAQS.map((faq, idx) => (
                <div className="faq-item" key={idx}>
                  <button
                    className="faq-question"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span>{faq.q}</span>
                    <span>{openFaq === idx ? '−' : '+'}</span>
                  </button>
                  {openFaq === idx && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}

              <div className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(askOpen ? null : FAQS.length)}
                >
                  <span>¿Tenés otra pregunta?</span>
                  <span>{askOpen ? '−' : '+'}</span>
                </button>
                {askOpen && (
                  <div className="faq-answer faq-ask">
                    <textarea
                      className="faq-ask-input"
                      placeholder="Escribí tu pregunta y te respondemos por WhatsApp..."
                      rows={3}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                    <button
                      type="button"
                      className="faq-ask-submit"
                      onClick={sendQuestion}
                      disabled={!question.trim()}
                    >
                      Enviar por WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </div>
  );
}
