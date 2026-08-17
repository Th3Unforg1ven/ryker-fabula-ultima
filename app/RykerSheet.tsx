"use client";

import { useState } from "react";

type ResourceProps = {
  label: string;
  value: number;
  max: number;
  tone: "blood" | "mana" | "ink" | "gold";
  onChange: (value: number) => void;
};

const spells = [
  { name: "Ignis", school: "Elementalismo", cost: "10 × A PM", target: "Até 3 criaturas", type: "Ofensivo · Instantâneo", effect: "Causa RA + 15 de dano de fogo a cada alvo atingido.", note: "Oportunidade: cada alvo atingido fica Abalado.", sigil: "✹", color: "ember" },
  { name: "Raio", school: "Elementalismo", cost: "20 PM", target: "Uma criatura", type: "Ofensivo · Instantâneo", effect: "Causa RA + 25 de dano de raio.", note: "O dano ignora Resistências.", sigil: "ϟ", color: "storm" },
  { name: "Aceleração", school: "Entropismo", cost: "20 PM", target: "Uma criatura", type: "Duração: Cena", effect: "No fim do turno, o alvo faz um ataque livre ou lança um feitiço de até 10 PM sem gastar uma ação.", note: "Termina depois que o mesmo alvo usa o efeito duas vezes.", sigil: "⌛", color: "time" },
  { name: "Drenar Espírito", school: "Entropismo", cost: "5 PM", target: "Uma criatura", type: "Ofensivo · Instantâneo", effect: "O alvo perde RA + 20 PM. Ryker recupera metade dos PM perdidos.", note: "Sem PM no alvo, não há recuperação.", sigil: "◉", color: "void" },
];

const attributes = [["DES", "Destreza", "d6"], ["AST", "Astúcia", "d8"], ["VIG", "Vigor", "d8"], ["VON", "Vontade", "d10"]];
const conditions = ["Lento", "Furioso", "Atordoado", "Fraco", "Envenenado", "Abalado"];

function Resource({ label, value, max, tone, onChange }: ResourceProps) {
  const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <article className={`resource ${tone}`} style={{ "--fill": `${percent}%` } as React.CSSProperties}>
      <span>{label}</span>
      <div className="resource-number"><strong>{value}</strong><small>/ {max}</small></div>
      <div className="resource-actions">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Diminuir ${label}`}>−</button>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Aumentar ${label}`}>+</button>
      </div>
    </article>
  );
}

export default function RykerSheet() {
  const [hp, setHp] = useState(45);
  const [mp, setMp] = useState(65);
  const [ip, setIp] = useState(6);
  const [fabula, setFabula] = useState(3);
  const [activeConditions, setActiveConditions] = useState<string[]>([]);

  const reset = () => { setHp(45); setMp(65); setIp(6); setFabula(3); setActiveConditions([]); };
  const toggleCondition = (condition: string) => setActiveConditions((current) => current.includes(condition) ? current.filter((item) => item !== condition) : [...current, condition]);

  return (
    <main>
      <header className="hero" id="topo">
        <div className="portrait-wrap">
          <img className="portrait" src="/ryker.jpg" alt="Ryker com sua máscara ritual de marfim" />
          <div className="portrait-index" aria-hidden="true"><span>†</span><b>V</b></div>
          <p className="portrait-caption">Ordem extinta · Registro de campo 05</p>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Arquivo do Mosteiro do Sol Negro · Sigilo quebrado</p>
          <h1>Ryker <em>Maximilian Severus von Falkenrath</em></h1>
          <p className="title">Dhampir · Exorcista · Elementalista III / Entropista II</p>
          <blockquote>“Eu devoro a magia dos monstros para não me tornar um deles.”</blockquote>
          <div className="identity-grid">
            <div><span>Identidade</span><b>Exorcista que devora magia monstruosa para continuar humano.</b></div>
            <div><span>Tema</span><b>Dúvida</b></div>
            <div><span>Origem</span><b>Mosteiro do Sol Negro</b></div>
            <div><span>Nível</span><b>5</b></div>
          </div>
        </div>
      </header>

      <nav className="section-nav" aria-label="Seções da ficha">
        <a href="#estado">Estado</a><a href="#magias">Magias</a><a href="#doutrina">Doutrina</a><a href="#classes">Classes</a><a href="#equipamento">Equipamento</a><a href="#perfil">Perfil</a>
      </nav>

      <section className="state-panel" id="estado">
        <div className="section-heading compact">
          <div><p>Controle de sessão</p><h2>Estado atual</h2></div>
          <div className="panel-actions"><button type="button" onClick={reset}>Restaurar ficha</button><button type="button" onClick={() => window.print()}>Imprimir</button></div>
        </div>
        <div className="resources">
          <Resource label="Pontos de Vida" value={hp} max={45} tone="blood" onChange={setHp} />
          <Resource label="Pontos de Mente" value={mp} max={65} tone="mana" onChange={setMp} />
          <Resource label="Inventário" value={ip} max={6} tone="ink" onChange={setIp} />
          <Resource label="Pontos de Fábula" value={fabula} max={5} tone="gold" onChange={setFabula} />
        </div>
        <div className="status-grid">
          <article className="attribute-panel"><p className="micro-label">Dados de atributo</p><div className="attributes">{attributes.map(([abbr, label, die]) => <div key={abbr}><span>{abbr}<small>{label}</small></span><strong>{die}</strong></div>)}</div></article>
          <article className="defense-panel"><p className="micro-label">Defesas e limiar</p><div className="defenses"><div><span>Defesa</span><strong>7</strong></div><div><span>Def. Mágica</span><strong>10</strong></div><div><span>Iniciativa</span><strong>−2</strong></div><div className={hp <= 22 ? "crisis active" : "crisis"}><span>Crise</span><strong>22</strong></div></div></article>
          <article className="condition-panel"><p className="micro-label">Condições</p><div className="condition-list">{conditions.map((condition) => <button type="button" className={activeConditions.includes(condition) ? "active" : ""} onClick={() => toggleCondition(condition)} aria-pressed={activeConditions.includes(condition)} key={condition}>{condition}</button>)}</div></article>
        </div>
      </section>

      <section className="content-section" id="magias">
        <div className="section-heading"><div><p>Liturgia profana</p><h2>Grimório de campo</h2></div><span className="section-mark" aria-hidden="true">IV</span></div>
        <div className="spell-grid">{spells.map((spell) => <article className={`spell-card ${spell.color}`} key={spell.name}><div className="spell-sigil" aria-hidden="true">{spell.sigil}</div><div className="spell-top"><span>{spell.school}</span><b>{spell.cost}</b></div><h3>{spell.name}</h3><p className="spell-meta">{spell.target} · {spell.type}</p><p>{spell.effect}</p><small>{spell.note}</small></article>)}</div>
        <p className="formula-note"><span>Teste ofensivo</span> [AST + VON] + 2 com o Tomo equipado</p>
      </section>

      <section className="content-section doctrine" id="doutrina">
        <div className="section-heading light"><div><p>Protocolo de exorcismo</p><h2>Doutrina de combate</h2></div><span className="section-mark" aria-hidden="true">†</span></div>
        <div className="turns">
          <article><span>01</span><div><h3>Quebre o ritmo</h3><p>Lance <b>Aceleração</b> em Ryker. No fim do turno, use <b>Drenar Espírito</b> em um inimigo que possua PM.</p></div></article>
          <article><span>02</span><div><h3>Escolha a sentença</h3><p><b>Raio</b> perfura Resistências contra um alvo prioritário. <b>Ignis</b> pune grupos e pode deixar todos Abalados.</p></div></article>
          <article><span>03</span><div><h3>Alimente o selo</h3><p>O segundo efeito de Aceleração permite outro Drenar Espírito. Depois disso, preserve PM e repita apenas se a cena exigir.</p></div></article>
        </div>
        <aside><b>Se o alvo não tiver PM:</b> não desperdice Drenar Espírito. Use Ignis, Raio ou um ataque com o Tomo.</aside>
      </section>

      <section className="content-section" id="classes">
        <div className="section-heading"><div><p>Disciplinas dominadas</p><h2>Classes e poderes</h2></div></div>
        <div className="class-grid">
          <article><span className="level">Nível 3</span><p className="micro-label">Elementalista</p><h3>O fogo que julga</h3><ul><li><b>Magia Elemental II</b> — aprende Ignis e Raio.</li><li><b>Artilharia Mágica I</b> — +2 em testes de Magia ofensiva com arma arcana.</li><li><b>Benefício</b> — +5 PM e rituais de Elementalismo.</li></ul></article>
          <article><span className="level">Nível 2</span><p className="micro-label">Entropista</p><h3>A fome entre instantes</h3><ul><li><b>Magia Entrópica II</b> — aprende Aceleração e Drenar Espírito.</li><li><b>Benefício</b> — +5 PM e rituais de Entropismo.</li><li><b>Função</b> — economia de ações e autossustentação de PM.</li></ul></article>
        </div>
      </section>

      <section className="content-section loadout" id="equipamento">
        <div className="section-heading light"><div><p>Relíquias autorizadas</p><h2>Equipamento</h2></div><span className="zenit">200z <small>+ 2d6 × 10z</small></span></div>
        <div className="equipment-grid"><article><span>Arma arcana · duas mãos</span><h3>Tomo</h3><p>Precisão <b>[AST + AST]</b><br />Dano <b>RA + 6 físico</b></p><small>100 zenit</small></article><article><span>Armadura</span><h3>Vestes de Sábio</h3><p>DEF <b>DES + 1</b><br />Defesa Mágica <b>AST + 2</b><br />Iniciativa <b>−2</b></p><small>200 zenit</small></article><article><span>Recuperação</span><h3>Elixir</h3><p>Gaste <b>3 PI</b> para recuperar <b>50 PM</b>.</p><small>Descanso restaura PV e PM por completo.</small></article></div>
      </section>

      <section className="content-section profile" id="perfil">
        <div className="profile-copy"><p className="eyebrow">O homem sob o selo</p><h2>A fome e a fé</h2><p>Alto e pálido, Ryker veste um sobretudo negro sobre vestes costuradas com fios de prata. Seus olhos ficam rubros ao absorver magia; runas escuras surgem nas mãos e no pescoço sempre que conjura.</p><p>Carrega um tomo de couro queimado, preso por corrente, e um rosário quebrado do Mosteiro do Sol Negro. Sua voz permanece baixa e controlada — como se cada palavra também mantivesse a fome sob controle.</p></div>
        <div className="oath"><span aria-hidden="true">✦</span><blockquote>“Se o meu poder vem das mesmas criaturas que caço, o que exatamente me diferencia delas?”</blockquote><small>Tema: Dúvida</small></div>
      </section>

      <footer><a href="#topo">Retornar ao selo</a><span>Fabula Ultima · Ficha de Ryker</span></footer>
    </main>
  );
}
