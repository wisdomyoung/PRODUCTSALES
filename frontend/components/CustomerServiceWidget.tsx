'use client';

import { useMemo, useState } from 'react';

type ChatItem = {
  role: 'assistant' | 'user';
  text: string;
};

const quickQuestions = [
  '如何下单？',
  '多久发货？',
  '支持删除订单吗？',
  '怎么联系人工？'
];

function answerQuestion(input: string) {
  const text = input.trim();
  if (!text) return '请先输入问题，我会尽力为您解答。';
  if (text.includes('下单')) return '先选择商品并填写收货信息，再点击“立即下单”即可。';
  if (text.includes('发货') || text.includes('多久')) return '当前演示版通常在后台录入物流后即可查看发货状态。';
  if (text.includes('删除订单') || text.includes('取消订单')) return '在“最近订单”卡片中点击“删除订单”即可，已签收订单不可删除。';
  if (text.includes('人工') || text.includes('客服')) return '当前为客服 MVP，可先留言常见问题；后续可接入企业微信或在线人工客服。';
  if (text.includes('物流')) return '下单后可在最近订单中查看物流轨迹与状态。';
  return '已收到您的问题。当前是演示版客服，可先查看常见问题，后续可接入人工客服系统。';
}

export function CustomerServiceWidget() {
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      role: 'assistant',
      text: '您好，我是小禾客服。可点击常见问题，或直接输入您的疑问。'
    }
  ]);

  const quickButtons = useMemo(
    () =>
      quickQuestions.map((item) => (
        <button
          key={item}
          type="button"
          className="cs-quick"
          onClick={() => {
            setMessages((current) => [
              ...current,
              { role: 'user', text: item },
              { role: 'assistant', text: answerQuestion(item) }
            ]);
          }}
        >
          {item}
        </button>
      )),
    []
  );

  const submitQuestion = () => {
    const text = question.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { role: 'user', text },
      { role: 'assistant', text: answerQuestion(text) }
    ]);
    setQuestion('');
  };

  return (
    <div className="cs-root">
      {dismissed ? (
        <button
          type="button"
          className="cs-restore"
          onClick={() => setDismissed(false)}
        >
          客服
        </button>
      ) : null}

      {open ? (
        <section className="cs-panel">
          <div className="cs-header">
            <div>
              <strong>小禾客服</strong>
              <p>果园客服助手</p>
            </div>
            <div className="cs-header-actions">
              <button type="button" className="secondary" onClick={() => setOpen(false)}>
                收起
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setOpen(false);
                  setDismissed(true);
                }}
              >
                关闭
              </button>
            </div>
          </div>

          <div className="cs-stage" aria-hidden="true">
            <div className="cs-fruit large">
              <div className="cs-fruit-stem" />
              <div className="cs-fruit-leaf" />
              <div className="cs-fruit-body">
                <div className="cs-fruit-face">
                  <span className="cs-fruit-eye" />
                  <span className="cs-fruit-eye" />
                  <span className="cs-fruit-smile" />
                  <span className="cs-fruit-cheek left" />
                  <span className="cs-fruit-cheek right" />
                </div>
              </div>
            </div>
            <div className="cs-bubble">您好，需要我帮您解答吗？</div>
          </div>

          <div className="cs-quick-list">{quickButtons}</div>

          <div className="cs-messages">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`cs-msg ${item.role}`}>
                {item.text}
              </div>
            ))}
          </div>

          <div className="cs-input-row">
            <input
              value={question}
              placeholder="请输入问题"
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  submitQuestion();
                }
              }}
            />
            <button type="button" onClick={submitQuestion}>发送</button>
          </div>
        </section>
      ) : null}

      {!dismissed ? (
        <button type="button" className="cs-trigger" onClick={() => setOpen((current) => !current)}>
          <div className="cs-fruit trigger">
            <div className="cs-fruit-stem" />
            <div className="cs-fruit-leaf" />
            <div className="cs-fruit-body">
              <div className="cs-fruit-face">
                <span className="cs-fruit-eye" />
                <span className="cs-fruit-eye" />
                <span className="cs-fruit-smile" />
                <span className="cs-fruit-cheek left" />
                <span className="cs-fruit-cheek right" />
              </div>
            </div>
          </div>
          <span className="cs-trigger-badge">鲜橙客服</span>
        </button>
      ) : null}
    </div>
  );
}
