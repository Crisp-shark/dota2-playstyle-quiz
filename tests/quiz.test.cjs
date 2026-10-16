const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Quiz=require('../quiz');
const Heroes=require('../heroes');
const Entrances=require('../hero-entrances');

const trio=[33,22,63]; // 谜团、宙斯、编织者

test('127 位英雄都可被选择，并生成各自的技能题',()=>{
  assert.equal(Heroes.count,127);
  assert.equal(Quiz.axes.length,5);
  for(const hero of Heroes.heroes){
    const other=Heroes.heroes.filter(item=>item.id!==hero.id).slice(0,2).map(item=>item.id);
    const ids=[hero.id,...other];
    assert.deepEqual(Quiz.validHeroIds(ids),ids);
    const questions=Quiz.questionsFor(ids);
    assert.equal(questions.length,9);
    assert.equal(questions[0].hero.id,hero.id);
    assert.ok(questions[0].prompt.includes(hero.name));
    assert.ok(questions[0].prompt.includes(Entrances.get(hero.id).cue));
    assert.ok(fs.existsSync(path.join(__dirname,'..',hero.image)),hero.image);
  }
});

test('每位本命英雄带来三道短题，均有四个不同选项',()=>{
  const questions=Quiz.questionsFor(trio);
  assert.deepEqual(questions.map(question=>question.hero.id),[33,33,33,22,22,22,63,63,63]);
  assert.equal(new Set(questions.map(question=>question.prompt)).size,9);
  for(const question of questions){
    assert.ok(question.prompt.length<=31,question.prompt);
    assert.equal(question.options.length,4);
    assert.equal(new Set(question.options.map(option=>option.text)).size,4);
    assert.ok(question.options.every(option=>option.text.length<=9));
    assert.ok(question.options.every(option=>Quiz.axes.some(axis=>axis.key===option.axis)));
  }
  assert.notDeepEqual(Quiz.questionsFor(trio).map(q=>q.prompt),Quiz.questionsFor([33,22,2]).map(q=>q.prompt));
});

test('同样的本命英雄可得到不同的短人格称号，结果仍匹配全部英雄',()=>{
  const titles=new Set();
  for(const answers of [Array(9).fill(0),Array(9).fill(1),Array(9).fill(2),Array(9).fill(3),[0,2,1,3,0,2,1,3,0]]){
    const result=Quiz.analyze(trio,answers);
    assert.ok(result);
    titles.add(result.profile.title);
    assert.ok(result.profile.title.length<=5);
    assert.equal(result.dimensions.length,5);
    assert.equal(result.matches.length,Heroes.count);
    assert.equal(result.echoes.length,3);
    assert.ok(result.echoes.every(match=>!trio.includes(match.hero.id)));
    assert.deepEqual(result.favorites.map(hero=>hero.id),trio);
    assert.match(Quiz.summary(result),/谜团、宙斯、编织者/);
  }
  assert.ok(titles.size>=4);
  for(const title of ['幸存者','西装暴徒','跟屁虫'])assert.ok(Quiz.profiles.some(profile=>profile.title===title));
});

test('无效英雄、重复英雄或未完成答案均不能生成结果',()=>{
  assert.equal(Quiz.validHeroIds([33,33,22]),null);
  assert.equal(Quiz.validHeroIds([33,22,999]),null);
  assert.equal(Quiz.questionsFor([33,22]).length,0);
  assert.equal(Quiz.sanitize(null,trio).length,9);
  assert.equal(Quiz.analyze([33,33,22],Array(9).fill(0)),null);
  assert.equal(Quiz.analyze(trio,[0,1]),null);
  assert.equal(Quiz.analyze(trio,Array(9).fill(4)),null);
});
