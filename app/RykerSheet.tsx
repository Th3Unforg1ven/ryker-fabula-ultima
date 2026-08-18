"use client";

import { useEffect, useState } from "react";

type ResourceProps = {
  label: string;
  value: number;
  max: number;
  tone: "blood" | "mana" | "ink" | "gold";
  onChange: (value: number) => void;
};

type Spell = {
  name: string;
  school: string;
  cost: string;
  target: string;
  type: string;
  effect: string;
  note: string;
  sigil: string;
  color: string;
  offensive: boolean;
};

type InventoryItem = { id: string; name: string; quantity: number; note: string };

const spells: Spell[] = [
  { name: "Ignis", school: "Elementalismo", cost: "10 × A PM", target: "Até 3 criaturas", type: "Ofensivo · Instantâneo", effect: "Causa RA + 15 de dano de fogo a cada alvo atingido.", note: "Oportunidade: cada alvo atingido fica Abalado.", sigil: "✹", color: "ember", offensive: true },
  { name: "Raio", school: "Elementalismo", cost: "20 PM", target: "Uma criatura", type: "Ofensivo · Instantâneo", effect: "Causa RA + 25 de dano de raio.", note: "O dano ignora Resistências, mas não Imunidade ou Absorção.", sigil: "ϟ", color: "storm", offensive: true },
  { name: "Glacies", school: "Elementalismo", cost: "10 × A PM", target: "Até 3 criaturas", type: "Ofensivo · Instantâneo", effect: "Causa RA + 15 de dano de gelo a cada alvo atingido.", note: "Oportunidade: cada alvo atingido também fica Lento.", sigil: "❄", color: "frost", offensive: true },
  { name: "Aceleração", school: "Entropismo", cost: "20 PM", target: "Uma criatura", type: "Duração: Cena", effect: "No fim de cada turno de Ryker, o alvo faz um ataque livre ou lança um feitiço de até 10 PM sem gastar uma ação.", note: "Termina depois que o mesmo alvo usa o efeito duas vezes.", sigil: "⌛", color: "time", offensive: false },
  { name: "Drenar Espírito", school: "Entropismo", cost: "5 PM", target: "Uma criatura", type: "Ofensivo · Instantâneo", effect: "O alvo perde RA + 20 PM. Ryker recupera metade dos PM realmente perdidos.", note: "Sem PM no alvo, não há recuperação.", sigil: "◉", color: "void", offensive: true },
  { name: "Curar", school: "Espiritualismo", cost: "10 × A PM", target: "Até 3 criaturas", type: "Suporte · Instantâneo", effect: "Cada alvo recupera 40 Pontos de Vida.", note: "Com Aceleração, pode curar um alvo por 10 PM sem gastar uma ação.", sigil: "✦", color: "ward", offensive: false },
];

const attributes = [["DES", "Destreza", "d6"], ["AST", "Astúcia", "d8"], ["VIG", "Vigor", "d8"], ["VON", "Vontade", "d10"]];
const conditions = ["Lento", "Enfurecido", "Atordoado", "Fraco", "Envenenado", "Abalado"];
const assetPath = (name: string) => `${import.meta.env.BASE_URL}${name.replace(/^\//, "")}`;
const storageKey = "ryker-sheet-state-v1";
const defaultInventory: InventoryItem[] = [
  { id: "agua-benta", name: "Água Benta", quantity: 1, note: "Item especial · efeito definido pelo Mestre" },
];
const initialState = { hp: 48, mp: 73, ip: 6, fabula: 3, xp: 6, activeConditions: [] as string[], inventoryItems: defaultInventory };

const savedNumber = (value: unknown, fallback: number, maximum: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(maximum, Math.trunc(value)))
    : fallback;

function Resource({ label, value, max, tone, onChange }: ResourceProps) {
  const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const step = max > 10 ? 5 : 1;

  const setClampedValue = (nextValue: number) => {
    if (Number.isFinite(nextValue)) {
      onChange(Math.max(0, Math.min(max, Math.trunc(nextValue))));
    }
  };

  return (
    <article className={`resource ${tone}`} style={{ "--fill": `${percent}%` } as React.CSSProperties}>
      <span>{label}</span>
      <div className="resource-number">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          value={value}
          aria-label={`Valor atual de ${label}`}
          title="Clique para digitar o valor"
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => setClampedValue(Number(event.currentTarget.value))}
        />
        <small>/ {max}</small>
      </div>
      <div className="resource-actions">
        <button type="button" onClick={() => setClampedValue(value - step)} aria-label={`Diminuir ${label} em ${step}`}>{step === 1 ? "−" : `−${step}`}</button>
        <button type="button" onClick={() => setClampedValue(value + step)} aria-label={`Aumentar ${label} em ${step}`}>{step === 1 ? "+" : `+${step}`}</button>
      </div>
    </article>
  );
}

export default function RykerSheet() {
  const [hp, setHp] = useState(initialState.hp);
  const [mp, setMp] = useState(initialState.mp);
  const [ip, setIp] = useState(initialState.ip);
  const [fabula, setFabula] = useState(initialState.fabula);
  const [xp, setXp] = useState(initialState.xp);
  const [activeConditions, setActiveConditions] = useState<string[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(defaultInventory);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemNote, setNewItemNote] = useState("");
  const [storageReady, setStorageReady] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hydration from browser-local saved state */
  useEffect(() => {
    try {
      const storedState = window.localStorage.getItem(storageKey);
      if (storedState) {
        const saved = JSON.parse(storedState) as Record<string, unknown>;
        setHp(savedNumber(saved.hp, initialState.hp, initialState.hp));
        setMp(savedNumber(saved.mp, initialState.mp, initialState.mp));
        setIp(savedNumber(saved.ip, initialState.ip, initialState.ip));
        setFabula(savedNumber(saved.fabula, initialState.fabula, 5));
        setXp(savedNumber(saved.xp, initialState.xp, 10));
        setActiveConditions(Array.isArray(saved.activeConditions)
          ? saved.activeConditions
            .map((condition) => condition === "Furioso" ? "Enfurecido" : condition)
            .filter((condition): condition is string => typeof condition === "string" && conditions.includes(condition))
          : initialState.activeConditions);
        setInventoryItems(Array.isArray(saved.inventoryItems)
          ? saved.inventoryItems.flatMap((item) => {
            if (!item || typeof item !== "object") return [];
            const candidate = item as Record<string, unknown>;
            if (typeof candidate.id !== "string" || typeof candidate.name !== "string" || !candidate.name.trim()) return [];
            return [{
              id: candidate.id,
              name: candidate.name.trim().slice(0, 60),
              quantity: Math.max(1, savedNumber(candidate.quantity, 1, 99)),
              note: typeof candidate.note === "string" ? candidate.note.trim().slice(0, 140) : "",
            }];
          })
          : initialState.inventoryItems);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setStorageReady(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ hp, mp, ip, fabula, xp, activeConditions, inventoryItems }));
  }, [storageReady, hp, mp, ip, fabula, xp, activeConditions, inventoryItems]);

  const reset = () => {
    setHp(initialState.hp);
    setMp(initialState.mp);
    setIp(initialState.ip);
    setFabula(initialState.fabula);
    setXp(initialState.xp);
    setActiveConditions(initialState.activeConditions);
    setInventoryItems(initialState.inventoryItems);
  };
  const toggleCondition = (condition: string) => setActiveConditions((current) => current.includes(condition) ? current.filter((item) => item !== condition) : [...current, condition]);

  const addInventoryItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newItemName.trim();
    if (!name) return;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setInventoryItems((current) => [...current, { id, name: name.slice(0, 60), quantity: Math.max(1, Math.min(99, newItemQuantity)), note: newItemNote.trim().slice(0, 140) }]);
    setNewItemName("");
    setNewItemQuantity(1);
    setNewItemNote("");
  };

  const changeItemQuantity = (id: string, nextQuantity: number) => {
    if (nextQuantity < 1) return;
    setInventoryItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.min(99, nextQuantity) } : item));
  };

  return (
    <main>
      <header className="hero" id="topo">
        <div className="portrait-wrap">
          <img className="portrait" src={assetPath("ryker.jpg")} alt="Ryker com sua máscara ritual de marfim" />
          <div className="portrait-index" aria-hidden="true"><span>†</span><b>VIII</b></div>
          <p className="portrait-caption">Ordem extinta · Registro de campo 05</p>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Arquivo do Mosteiro do Sol Negro · Sigilo quebrado</p>
          <h1>Ryker <em>Maximilian Severus von Falkenrath</em></h1>
          <p className="title">Dhampir · Exorcista · Elementalista V / Entropista II / Espiritualista I</p>
          <blockquote>“Eu devoro a magia dos monstros para não me tornar um deles.”</blockquote>
          <div className="identity-grid">
            <div><span>Identidade</span><b>Exorcista que devora magia monstruosa para continuar humano.</b></div>
            <div><span>Tema</span><b>Dúvida</b></div>
            <div><span>Origem</span><b>Mosteiro do Sol Negro</b></div>
            <div><span>Nível</span><b>8</b></div>
          </div>
        </div>
      </header>

      <nav className="section-nav" aria-label="Seções da ficha">
        <a href="#estado">Estado</a><a href="#magias">Magias</a><a href="#manual">Manual</a><a href="#classes">Classes</a><a href="#equipamento">Equipamento</a><a href="#historia">História</a><a href="#perfil">Perfil</a>
      </nav>

      <section className="state-panel" id="estado">
        <div className="section-heading compact">
          <div><p>Controle de sessão</p><h2>Estado atual</h2></div>
          <div className="panel-actions"><span className="save-status" aria-live="polite">{storageReady ? "Salvo neste dispositivo" : "Carregando ficha..."}</span><button type="button" onClick={reset}>Restaurar ficha</button><button type="button" onClick={() => window.print()}>Imprimir</button></div>
        </div>
        <div className="resources">
          <Resource label="Pontos de Vida" value={hp} max={48} tone="blood" onChange={setHp} />
          <Resource label="Pontos de Mente" value={mp} max={73} tone="mana" onChange={setMp} />
          <Resource label="Inventário" value={ip} max={6} tone="ink" onChange={setIp} />
          <Resource label="Pontos de Fábula" value={fabula} max={5} tone="gold" onChange={setFabula} />
          <Resource label="Experiência" value={xp} max={10} tone="gold" onChange={setXp} />
        </div>
        <div className="status-grid">
          <article className="attribute-panel"><p className="micro-label">Dados de atributo</p><div className="attributes">{attributes.map(([abbr, label, die]) => <div key={abbr}><span>{abbr}<small>{label}</small></span><strong>{die}</strong></div>)}</div></article>
          <article className="defense-panel"><p className="micro-label">Defesas e limiar</p><div className="defenses"><div><span>Defesa</span><strong>9</strong></div><div><span>Def. Mágica</span><strong>10</strong></div><div><span>Iniciativa</span><strong>−2</strong></div><div className={hp <= 24 ? "crisis active" : "crisis"}><span>Crise</span><strong>24</strong></div></div></article>
          <article className="condition-panel"><p className="micro-label">Condições</p><div className="condition-list">{conditions.map((condition) => <button type="button" className={activeConditions.includes(condition) ? "active" : ""} onClick={() => toggleCondition(condition)} aria-pressed={activeConditions.includes(condition)} key={condition}>{condition}</button>)}</div></article>
        </div>
      </section>

      <section className="content-section" id="magias">
        <div className="section-heading"><div><p>Liturgia profana</p><h2>Grimório de campo</h2></div><span className="section-mark" aria-hidden="true">VI</span></div>
        <div className="spell-grid">{spells.map((spell) => <article className={`spell-card ${spell.color}`} key={spell.name}>
            <div className="spell-sigil" aria-hidden="true">{spell.sigil}</div><div className="spell-top"><span>{spell.school}</span><b>{spell.cost}</b></div>
            <h3>{spell.name}</h3><p className="spell-meta">{spell.target} · {spell.type}</p><p>{spell.effect}</p><small>{spell.note}</small>
            <p className="spell-formula">{spell.offensive ? "Rolagem: d8 AST + d10 VON + 4 vs Def. Mágica · RA = maior dado" : "Rolagem: nenhuma · sucesso automático"}</p>
          </article>)}</div>
        <p className="formula-note"><span>Importante</span> crítico é par de 6 ou mais; ele acerta automaticamente e gera uma Oportunidade, mas não dobra o dano.</p>
      </section>

      <section className="content-section quick-reference" id="manual">
        <div className="section-heading"><div><p>Folha de consulta</p><h2>Manual rápido de mesa</h2></div><span className="section-mark" aria-hidden="true">✦</span></div>
        <div className="roll-guide">
          <div><p className="micro-label">Como montar a rolagem</p><h3>Role dois dados e some</h3><p>Escolha os dois Atributos pedidos, role os dados correspondentes, some os valores e aplique o modificador. A RA é apenas o maior resultado natural entre os dados.</p></div>
          <div className="roll-examples"><p><span>Magia ofensiva de Ryker</span><b>d8 AST + d10 VON + 4</b><small>Compare com a Defesa Mágica de cada alvo.</small></p><p><span>Estudo</span><b>d8 AST + d8 AST</b><small>Teste aberto: 7 / 10 / 13 / 16 indicam a qualidade.</small></p><p><span>Iniciativa de Ryker</span><b>d6 DES + d8 AST − 2</b><small>Use no teste em grupo de iniciativa.</small></p></div>
        </div>
        <div className="reference-grid">
          <details open><summary>Teste comum e dificuldades</summary><p>Role exatamente dois dados de Atributo, some os resultados e modificadores. Se o total alcançar o ND, passou.</p><ul><li>ND 7: básico</li><li>ND 10: competente</li><li>ND 13: especialista</li><li>ND 16: lendário</li><li>Situação favorável ou desfavorável: normalmente ±2</li></ul></details>
          <details open><summary>Crítico, falha crítica e RA</summary><p><b>RA</b> é o maior dos dois dados. <b>Crítico</b>: dados iguais e ambos 6 ou mais; sucesso automático e uma Oportunidade. <b>Falha crítica</b>: dois resultados 1; falha automática, a oposição ganha uma Oportunidade e Ryker recebe 1 PF.</p></details>
          <details open><summary>Magia em seis passos</summary><ol><li>Escolha feitiço e efeito.</li><li>Escolha alvos visíveis.</li><li>Confirme que pode falar e mover os braços.</li><li>Pague o custo total de PM.</li><li>Se for ofensivo, role d8 + d10 + 4 contra Def.M; suporte não rola.</li><li>Aplique RA, dano, cura ou condição.</li></ol></details>
          <details open><summary>Afinidades e dano</summary><ul><li>Vulnerável: perde o dobro de PV.</li><li>Resistente: perde metade dos PV.</li><li>Imune: perde 0 PV.</li><li>Absorvedor: recupera PV em vez de perder.</li></ul><p><b>Raio</b> ignora apenas Resistência. Imunidade e Absorção continuam valendo.</p></details>
          <details open><summary>Ações que ganham combates</summary><ul><li><b>Estudo:</b> teste aberto, geralmente AST + AST. Descubra Vulnerabilidades antes de gastar PM.</li><li><b>Guarda:</b> fica Resistente a todo dano até seu próximo turno, ganha +2 em testes opostos e pode cobrir um aliado contra ataques corpo a corpo.</li><li><b>Impedimento:</b> teste ND 10; em sucesso, cause Abalado, Atordoado, Fraco ou Lento.</li><li><b>Inventário:</b> gaste PI para criar e usar um consumível imediatamente.</li></ul></details>
          <details open><summary>Pontos de Fábula</summary><ul><li><b>Evocar Traço:</b> gaste 1 PF e use Identidade, Tema ou Origem para rolar novamente um ou ambos os dados. O novo resultado permanece.</li><li><b>Evocar Laço:</b> gaste 1 PF e some a força do Laço ao teste, uma vez por teste.</li><li>Não é possível evocar um Traço depois de uma falha crítica.</li></ul></details>
          <details open><summary>Condições</summary><ul><li>Abalado: VON −1 passo.</li><li>Atordoado: AST −1 passo.</li><li>Enfurecido: DES e AST −1 passo.</li><li>Envenenado: VIG e VON −1 passo.</li><li>Fraco: VIG −1 passo.</li><li>Lento: DES −1 passo.</li></ul><p>Condições diferentes se acumulam; nenhum dado cai abaixo de d6.</p></details>
          <details open><summary>Testes opostos e em grupo</summary><p><b>Oposto:</b> ambos rolam sem ND; o maior total vence e empates são rolados novamente. Crítico supera resultado normal; falha crítica é o pior resultado.</p><p><b>Grupo:</b> o líder faz o teste final. Apoiadores testam a mesma fórmula contra ND 10; cada sucesso dá +1 ao líder. Entre os apoiadores bem-sucedidos, some também o Laço mais forte com o líder.</p></details>
          <details open><summary>Boas Oportunidades</summary><ul><li><b>Vantagem:</b> dê +4 ao próximo teste seu ou de um aliado.</li><li><b>Avaliar:</b> descubra uma Vulnerabilidade ou Traço.</li><li><b>Progresso:</b> preencha ou apague até 2 seções de um relógio.</li><li><b>Desmascarar:</b> descubra objetivos e motivações de uma criatura.</li></ul><p>Em Ignis e Glacies, o crítico também pode acionar a Oportunidade própria do feitiço.</p></details>
          <details open><summary>Plano de turno do Ryker</summary><ol><li>Se a Afinidade for desconhecida, peça Estudo ao grupo.</li><li>Explore Vulnerabilidade; use Raio contra simples Resistência.</li><li>Use Aceleração cedo se a cena durar ao menos duas rodadas.</li><li>Quando PM apertar, use Drenar Espírito em alvo que ainda tenha PM.</li><li>Se a linha de frente estiver em risco, Curar; se Ryker estiver focado, Guarda.</li></ol></details>
        </div>
      </section>

      <section className="content-section" id="classes">
        <div className="section-heading"><div><p>Disciplinas dominadas</p><h2>Classes e poderes</h2></div></div>
        <div className="class-grid">
          <article><span className="level">Nível 5</span><p className="micro-label">Elementalista</p><h3>O fogo que julga</h3><ul><li><b>Magia Elemental III</b> — aprende Ignis, Raio e Glacies.</li><li><b>Artilharia Mágica II</b> — +4 em testes de Magia ofensiva com arma arcana.</li><li><b>Benefício</b> — +5 PM e acesso a rituais.</li></ul></article>
          <article><span className="level">Nível 2</span><p className="micro-label">Entropista</p><h3>A fome entre instantes</h3><ul><li><b>Magia Entrópica II</b> — aprende Aceleração e Drenar Espírito.</li><li><b>Benefício</b> — +5 PM e rituais de Entropismo.</li><li><b>Função</b> — economia de ações e autossustentação de PM.</li></ul></article>
          <article><span className="level">Nível 1</span><p className="micro-label">Espiritualista</p><h3>A luz que preserva</h3><ul><li><b>Magia Espiritual I</b> — aprende Curar.</li><li><b>Benefício</b> — +5 PM e acesso a rituais.</li><li><b>Função</b> — recupera 40 PV de até três criaturas.</li></ul></article>
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
            <div className="inventory-title"><div><span>Reserva abstrata</span><h3>Itens de PI</h3></div><strong>{ip}<small>/ 6 PI</small></strong></div>
            <div className="inventory-head"><span>Item</span><span>Qtd./Custo</span><span>Efeito</span></div>
            <ul className="inventory-list">
              <li><span className="item-mark potion">✦</span><b>Elixir</b><em>3 PI</em><p>Recupera 50 PM</p></li>
              <li><span className="item-mark remedy">✚</span><b>Remédio</b><em>3 PI</em><p>Recupera 50 PV</p></li>
              <li><span className="item-mark tonic">◇</span><b>Tônico</b><em>2 PI</em><p>Remove todas as condições</p></li>
              <li><span className="item-mark shard">ϟ</span><b>Fragmento elemental</b><em>2 PI</em><p>Causa 10 de dano elemental</p></li>
              <li><span className="item-mark tent">⌂</span><b>Barraca mágica</b><em>4 PI</em><p>Permite descansar nos ermos</p></li>
            </ul>
            <div className="inventory-foot"><span>Itens de PI são criados e usados imediatamente.</span><b>Equipamento: 500z / 500z</b></div>

            <div className="inventory-title backpack-title"><div><span>Objetos carregados</span><h3>Mochila editável</h3></div><strong>{inventoryItems.reduce((sum, item) => sum + item.quantity, 0)}<small>un.</small></strong></div>
            <ul className="backpack-list">
              {inventoryItems.length === 0 && <li className="empty-backpack">A mochila está vazia. Adicione um item abaixo.</li>}
              {inventoryItems.map((item) => <li key={item.id}>
                <span className="item-mark holy">✧</span>
                <div><b>{item.name}</b><p>{item.note || "Sem anotação"}</p></div>
                <div className="quantity-control"><button type="button" onClick={() => changeItemQuantity(item.id, item.quantity - 1)} aria-label={`Diminuir quantidade de ${item.name}`}>−</button><strong>{item.quantity}</strong><button type="button" onClick={() => changeItemQuantity(item.id, item.quantity + 1)} aria-label={`Aumentar quantidade de ${item.name}`}>+</button></div>
                <button className="delete-item" type="button" onClick={() => setInventoryItems((current) => current.filter((candidate) => candidate.id !== item.id))} aria-label={`Excluir ${item.name}`}>Excluir</button>
              </li>)}
            </ul>
            <form className="inventory-form" onSubmit={addInventoryItem}>
              <label>Item<input required maxLength={60} value={newItemName} onChange={(event) => setNewItemName(event.currentTarget.value)} placeholder="Ex.: estaca de prata" /></label>
              <label>Qtd.<input type="number" min={1} max={99} value={newItemQuantity} onChange={(event) => setNewItemQuantity(Math.max(1, Math.min(99, Number(event.currentTarget.value) || 1)))} /></label>
              <label className="item-note">Anotação<input maxLength={140} value={newItemNote} onChange={(event) => setNewItemNote(event.currentTarget.value)} placeholder="Efeito, origem ou detalhe" /></label>
              <button type="submit">Adicionar item</button>
            </form>
            <p className="inventory-save-note">A mochila é salva automaticamente neste navegador junto com PV, PM, PI e XP.</p>
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
