const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Quiz=require('../quiz');
const Heroes=require('../heroes');

test('18 道短题穿插装备与论坛话题，并覆盖五种打法倾向',()=>{
  assert.equal(Quiz.axes.length,5);
  assert.equal(Quiz.questions.length,18);
  assert.equal(Quiz.questions.filter(question=>question.type==='item').length,10);
  assert.equal(Quiz.questions.filter(question=>question.type==='forum').length,8);
  for(const axis of Quiz.axes){
    assert.ok(Quiz.questions.filter(question=>question.axis===axis.key).length>=3);
  }
  for(const question of Quiz.questions){
    assert.ok(question.prompt.length<=22);
    assert.equal(question.options.length,4);
    assert.deepEqual(question.options.map(option=>option.value).sort((a,b)=>a-b),[-2,-1,1,2]);
    assert.equal(new Set(question.options.map(option=>option.text)).size,4);
    if(question.type==='forum')assert.match(question.source,/^https:\/\/www\.reddit\.com\//);
    for(const option of question.options){
      assert.ok(option.text.length<=7);
      assert.ok(Quiz.axes.some(axis=>axis.key===option.bonusAxis));
      assert.ok(option.image||option.mark);
      if(option.image)assert.ok(fs.existsSync(path.join(__dirname,'..',option.image)),option.image);
    }
  }
});

test('装备选择可生成结果并覆盖全部英雄',()=>{
  assert.equal(Heroes.count,127);
  const titles=new Set();
  for(const choice of [0,1,2,3]){
    const result=Quiz.analyze(Array(Quiz.questions.length).fill(choice));
    assert.ok(result);
    titles.add(result.profile.title);
    assert.equal(result.dimensions.length,5);
    assert.equal(result.matches.length,Heroes.count);
    assert.equal(new Set(result.matches.map(match=>match.hero.id)).size,Heroes.count);
    assert.ok(result.matches.every(match=>fs.existsSync(path.join(__dirname,'..',match.hero.image))));
    assert.ok(!/\b[IE][SN][TF][JP]\b/.test(Quiz.summary(result)));
  }
  assert.ok(titles.size>=3);
});

test('未答完或损坏的答案不会产生结果',()=>{
  assert.equal(Quiz.sanitize(null).length,Quiz.questions.length);
  assert.equal(Quiz.analyze([0,1]),null);
  assert.equal(Quiz.analyze(Array(Quiz.questions.length).fill(4)),null);
});
