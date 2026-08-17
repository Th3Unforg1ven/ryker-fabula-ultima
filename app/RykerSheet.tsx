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
const assetPath = (name: string) => `${import.meta.env.BASE_URL}${name.replace(/^\//, "")}`;

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
  const [hp, setHp] = useState(46);
  const [mp, setMp] = useState(66);
  const [ip, setIp] = useState(6);
  const [fabula, setFabula] = useState(3);
  const [xp, setXp] = useState(6);
  const [activeConditions, setActiveConditions] = useState<string[]>([]);

  const reset = () => { setHp(46); setMp(66); setIp(6); setFabula(3); setActiveConditions([]); };
  const toggleCondition = (condition: string) => setActiveConditions((current) => current.includes(condition) ? current.filter((item) => item !== condition) : [...current, condition]);

  return (
    <main>
      <header className="hero" id="topo">
        <div className="portrait-wrap">
          <img className="portrait" src={assetPath("ryker.jpg")} alt="Ryker com sua máscara ritual de marfim" />
          <div className="portrait-index" aria-hidden="true"><span>†</span><b>VI</b></div>
          <p className="portrait-caption">Ordem extinta · Registro de campo 05</p>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Arquivo do Mosteiro do Sol Negro · Sigilo quebrado</p>
          <h1>Ryker <em>Maximilian Severus von Falkenrath</em></h1>
          <p className="title">Dhampir · Exorcista · Elementalista IV / Entropista II</p>
          <blockquote>“Eu devoro a magia dos monstros para não me tornar um deles.”</blockquote>
          <div className="identity-grid">
            <div><span>Identidade</span><b>Exorcista que devora magia monstruosa para continuar humano.</b></div>
            <div><span>Tema</span><b>Dúvida</b></div>
            <div><span>Origem</span><b>Mosteiro do Sol Negro</b></div>
            <div><span>Nível</span><b>6</b></div>
          </div>
        </div>
      </header>

      <nav className="section-nav" aria-label="Seções da ficha">
        <a href="#estado">Estado</a><a href="#magias">Magias</a><a href="#classes">Classes</a><a href="#equipamento">Equipamento</a><a href="#historia">História</a><a href="#perfil">Perfil</a>
      </nav>

      <section className="state-panel" id="estado">
        <div className="section-heading compact">
          <div><p>Controle de sessão</p><h2>Estado atual</h2></div>
          <div className="panel-actions"><button type="button" onClick={reset}>Restaurar ficha</button><button type="button" onClick={() => window.print()}>Imprimir</button></div>
        </div>
        <div className="resources">
          <Resource label="Pontos de Vida" value={hp} max={46} tone="blood" onChange={setHp} />
          <Resource label="Pontos de Mente" value={mp} max={66} tone="mana" onChange={setMp} />
          <Resource label="Inventário" value={ip} max={6} tone="ink" onChange={setIp} />
          <Resource label="Pontos de Fábula" value={fabula} max={5} tone="gold" onChange={setFabula} />
          <Resource label="Experiência" value={xp} max={10} tone="gold" onChange={setXp} />
        </div>
        <div className="status-grid">
          <article className="attribute-panel"><p className="micro-label">Dados de atributo</p><div className="attributes">{attributes.map(([abbr, label, die]) => <div key={abbr}><span>{abbr}<small>{label}</small></span><strong>{die}</strong></div>)}</div></article>
          <article className="defense-panel"><p className="micro-label">Defesas e limiar</p><div className="defenses"><div><span>Defesa</span><strong>9</strong></div><div><span>Def. Mágica</span><strong>10</strong></div><div><span>Iniciativa</span><strong>−2</strong></div><div className={hp <= 23 ? "crisis active" : "crisis"}><span>Crise</span><strong>23</strong></div></div></article>
          <article className="condition-panel"><p className="micro-label">Condições</p><div className="condition-list">{conditions.map((condition) => <button type="button" className={activeConditions.includes(condition) ? "active" : ""} onClick={() => toggleCondition(condition)} aria-pressed={activeConditions.includes(condition)} key={condition}>{condition}</button>)}</div></article>
        </div>
      </section>

      <section className="content-section" id="magias">
        <div className="section-heading"><div><p>Liturgia profana</p><h2>Grimório de campo</h2></div><span className="section-mark" aria-hidden="true">IV</span></div>
        <div className="spell-grid">{spells.map((spell) => <article className={`spell-card ${spell.color}`} key={spell.name}><div className="spell-sigil" aria-hidden="true">{spell.sigil}</div><div className="spell-top"><span>{spell.school}</span><b>{spell.cost}</b></div><h3>{spell.name}</h3><p className="spell-meta">{spell.target} · {spell.type}</p><p>{spell.effect}</p><small>{spell.note}</small></article>)}</div>
        <p className="formula-note"><span>Teste ofensivo</span> [AST + VON] + 4 com o Tomo do Sol Negro equipado</p>
      </section>

      <section className="content-section" id="classes">
        <div className="section-heading"><div><p>Disciplinas dominadas</p><h2>Classes e poderes</h2></div></div>
        <div className="class-grid">
          <article><span className="level">Nível 4</span><p className="micro-label">Elementalista</p><h3>O fogo que julga</h3><ul><li><b>Magia Elemental II</b> — aprende Ignis e Raio.</li><li><b>Artilharia Mágica II</b> — +4 em testes de Magia ofensiva com arma arcana.</li><li><b>Benefício</b> — +5 PM e rituais de Elementalismo.</li></ul></article>
          <article><span className="level">Nível 2</span><p className="micro-label">Entropista</p><h3>A fome entre instantes</h3><ul><li><b>Magia Entrópica II</b> — aprende Aceleração e Drenar Espírito.</li><li><b>Benefício</b> — +5 PM e rituais de Entropismo.</li><li><b>Função</b> — economia de ações e autossustentação de PM.</li></ul></article>
        </div>
      </section>

      <section className="content-section loadout" id="equipamento">
        <div className="section-heading light"><div><p>Relíquias autorizadas</p><h2>Equipamento</h2></div><span className="zenit">2d6 × 10z <small>dinheiro inicial · 20–120z</small></span></div>
        <div className="equipment-shell">
          <article className="paper-doll" aria-label="Equipamentos vestidos por Ryker">
            <div className="gear-slot head empty"><span>Cabeça</span><b>—</b><small>vazio</small></div>
            <div className="gear-slot main-hand"><span>Mão principal</span><b>Tomo do Sol Negro</b><small>VON + VON · RA + 2 luz</small></div>
            <div className="character-token"><img src={assetPath("ryker.jpg")} alt="Retrato de Ryker" /><span>Ryker</span><small>Equipado</small></div>
            <div className="gear-slot off-hand"><span>Mão secundária</span><b>Mão do Confessor</b><small>Escudo · DEF +2</small></div>
            <div className="gear-slot accessory"><span>Acessório</span><b>Rosário partido</b><small>relíquia narrativa</small></div>
            <div className="gear-slot body"><span>Corpo</span><b>Vestes de Sábio</b><small>DEF +1 · Def.M +2 · Inic. −2</small></div>
            <div className="gear-slot pack"><span>Mochila</span><b>Registros do Sol Negro</b><small>provas da purgação</small></div>
          </article>

          <article className="inventory-ledger">
            <div className="inventory-title"><div><span>Mochila de campo</span><h3>Inventário</h3></div><strong>{ip}<small>/ 6 PI</small></strong></div>
            <div className="inventory-head"><span>Item</span><span>Qtd./Custo</span><span>Efeito</span></div>
            <ul className="inventory-list">
              <li><span className="item-mark potion">✦</span><b>Elixir</b><em>3 PI</em><p>Recupera 50 PM</p></li>
              <li><span className="item-mark remedy">✚</span><b>Remédio</b><em>3 PI</em><p>Recupera 50 PV</p></li>
              <li><span className="item-mark tonic">◇</span><b>Tônico</b><em>2 PI</em><p>Remove todas as condições</p></li>
              <li><span className="item-mark shard">ϟ</span><b>Fragmento elemental</b><em>2 PI</em><p>Causa 10 de dano elemental</p></li>
              <li><span className="item-mark tent">⌂</span><b>Barraca mágica</b><em>4 PI</em><p>Permite descansar nos ermos</p></li>
              <li><span className="item-mark holy">✧</span><b>Água Benta</b><em>×1</em><p>Item especial · efeito definido pelo Mestre</p></li>
            </ul>
            <div className="inventory-foot"><span>Itens de PI são criados e usados imediatamente.</span><b>Equipamento: 500z / 500z</b></div>
          </article>
        </div>
      </section>

      <section className="content-section story" id="historia">
        <div className="section-heading"><div><p>Confissão preservada em cinzas</p><h2>A história do Sol Negro</h2></div><span className="section-mark" aria-hidden="true">☉</span></div>
        <div className="story-layout">
          <div className="chapters">
            <article className="story-intro"><p>Ryker Maximilian Severus von Falkenrath nasceu entre duas naturezas: herdeiro de uma linhagem vampírica da Estíria e filho de uma mulher humana que se recusou a entregá-lo à fome. A Casa Falkenrath não criava apenas predadores; buscava produzir um receptáculo capaz de consumir a essência sobrenatural de outras criaturas. Sua mãe fugiu antes que o ritual fosse concluído e confiou o menino ao único lugar que aceitou escondê-lo: o Mosteiro do Sol Negro.</p></article>
            <article className="chapter"><span className="chapter-number">I</span><div><h3>O mosteiro dos condenados</h3><p>O Sol Negro era uma ordem clandestina de exorcistas que acolhia pessoas marcadas por maldições. Sob a tutela de <b>Madre Severine</b>, Ryker aprendeu que uma corrupção não precisa ser negada para ser combatida: ela pode ser nomeada, contida e voltada contra aquilo que a criou. O Elementalismo tornou-se sua chama purificadora; o Entropismo, o bisturi com que arrancava magia de demônios, mortos-vivos e feiticeiros.</p></div></article>
            <article className="chapter"><span className="chapter-number">II</span><div><h3>A comunhão negra</h3><p>Para Ryker, <b>Drenar Espírito</b> não é apenas um feitiço. É a forma disciplinada de sua fome. Ele absorve a energia monstruosa, alimenta o selo que o mantém humano e devolve essa força como magia. Porém, cada essência consumida deixa um eco: lembranças, desejos e vozes que não lhe pertencem. Ryker teme que um dia não consiga distinguir sua consciência do coro dentro dele.</p></div></article>
            <article className="chapter"><span className="chapter-number">III</span><div><h3>A noite do segundo crepúsculo</h3><p>O <b>Tribunal da Chama Branca</b> declarou o mosteiro herético e o reduziu a cinzas. Durante o massacre, Madre Severine quebrou o rosário que selava a aura de Ryker e o mandou fugir com o Tomo do Sol Negro e registros capazes de provar que a purgação teve motivos políticos. Ele sobreviveu; não sabe se mais alguém conseguiu. Desde então, é caçado tanto pela Igreja quanto pela Casa Falkenrath, que ainda o considera propriedade de sangue.</p></div></article>
            <article className="chapter"><span className="chapter-number">IV</span><div><h3>O exorcista errante</h3><p>Ryker viaja oferecendo seus ritos a vilas que sacerdotes abandonaram e enfrentando monstros que reconhecem nele um semelhante. Procura o mandante da destruição do mosteiro, possíveis sobreviventes e a verdade sobre o ritual interrompido em seu nascimento. Sua dúvida não é se possui uma parte monstruosa — isso ele já aceitou. É se pode continuar usando a fome como arma sem permitir que ela se torne sua identidade.</p></div></article>
          </div>
          <aside className="story-aside">
            <div><p className="micro-label">Relíquias</p><dl className="relic-list"><dt>Mão do Confessor</dt><dd>Máscara de osso com olhos entalhados. Revela a contaminação espiritual e funciona mecanicamente como um Escudo de Bronze.</dd><dt>Rosário partido</dt><dd>Última lembrança de Madre Severine e do juramento feito entre as ruínas; não concede bônus mecânicos.</dd><dt>Tomo do Sol Negro</dt><dd>Arquivo dos ritos proibidos da ordem e arma arcana de uma mão; usa as regras da Maça Abençoada.</dd></dl><small>Os nomes e a aparência foram alterados, mas as estatísticas seguem os equipamentos do livro.</small></div>
            <div className="goals"><p className="micro-label">Objetivos</p><ul><li>Descobrir quem ordenou a purgação.</li><li>Encontrar sobreviventes do mosteiro.</li><li>Impedir que os Falkenrath concluam o ritual.</li><li>Provar que sua fome pode servir à humanidade.</li></ul></div>
          </aside>
        </div>
      </section>

      <section className="content-section profile" id="perfil">
        <div className="profile-copy"><p className="eyebrow">O homem sob o selo</p><h2>A fome e a fé</h2><p>Alto e pálido, Ryker veste um sobretudo negro sobre vestes costuradas com fios de prata. Seus olhos ficam rubros ao absorver magia; runas escuras surgem nas mãos e no pescoço sempre que conjura.</p><p>Carrega um tomo de couro queimado, preso por corrente, e um rosário quebrado do Mosteiro do Sol Negro. Sua voz permanece baixa e controlada — como se cada palavra também mantivesse a fome sob controle.</p></div>
        <div className="oath"><span aria-hidden="true">✦</span><blockquote>“Se o meu poder vem das mesmas criaturas que caço, o que exatamente me diferencia delas?”</blockquote><small>Tema: Dúvida</small></div>
      </section>

      <footer><a href="#topo">Retornar ao selo</a><span>Fabula Ultima · Ficha de Ryker</span></footer>
    </main>
  );
}
