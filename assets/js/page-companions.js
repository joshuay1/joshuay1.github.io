(() => {
  const page = document.querySelector(".about-page");
  const canvas = document.querySelector(".page-companions-canvas");
  if (!page || !canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const toggle = document.querySelector(".page-companions-toggle");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const ambientOpacity = 0.35;
  const appearances = [
    {
      color: "#31595f",
      light: "#46737a",
      skin: "#cf9b77",
      shade: "#b27c59",
      hair: "#282b2d",
      hairLight: "#414747",
      style: "curly",
      pants: "#35424b",
    },
    { color: "#d9a747", light: "#f0c776", skin: "#efbd92", shade: "#d69a74", hair: "#75432d", hairLight: "#9a6240", style: "long", pants: "#49595b" },
    {
      color: "#aa3f2c",
      light: "#ca6851",
      skin: "#b97c58",
      shade: "#9a6246",
      hair: "#242c34",
      hairLight: "#46515b",
      style: "short",
      pants: "#35475c",
    },
    {
      color: "#4b6550",
      light: "#779476",
      skin: "#d9a476",
      shade: "#b57c55",
      hair: "#713e25",
      hairLight: "#ad6334",
      style: "glasses",
      pants: "#373b36",
    },
    { color: "#3c567c", light: "#6380a4", skin: "#9d684d", shade: "#794b3b", hair: "#292529", hairLight: "#4c3d3a", style: "cap", pants: "#354253" },
  ];
  const spriteCache = new Map();
  function personSprite(index, facing, pose, blink) {
    const id = `${index}-${facing}-${pose}-${blink}`;
    if (spriteCache.has(id)) return spriteCache.get(id);
    const sprite = document.createElement("canvas");
    sprite.width = 32;
    sprite.height = 40;
    const pen = sprite.getContext("2d"),
      a = appearances[index];
    const ink = "#242526";
    const pixel = (x, y, w, h, color) => {
      pen.fillStyle = color;
      pen.fillRect(x, y, w, h);
    };
    const bands = (rows, color) => rows.forEach(([x, y, w, h]) => pixel(x, y, w, h, color));
    const stride = [0, 1, 0, -1][pose];
    // Short, straight-sided torso; only the limb ends have softened pixel corners.
    if (a.style === "long") {
      bands(
        [
          [7, 10, 18, 17],
          [5, 16, 22, 10],
          [4, 24, 6, 5],
          [22, 24, 6, 5],
          [6, 29, 4, 2],
          [22, 29, 4, 2],
        ],
        ink
      );
      bands(
        [
          [6, 17, 3, 10],
          [23, 17, 3, 10],
          [5, 25, 4, 3],
          [23, 25, 4, 3],
        ],
        a.hair
      );
      bands(
        [
          [7, 18, 1, 8],
          [24, 20, 1, 7],
        ],
        a.hairLight
      );
    }
    bands(
      [
        [9, 26, 14, 1],
        [7, 27, 18, 8],
        [8, 35, 16, 1],
      ],
      ink
    );
    pixel(8, 28, 16, 6, a.color);
    pixel(9, 27, 14, 1, a.color);
    pixel(9, 29, 3, 4, a.light);
    pixel(20, 30, 3, 4, a.color);
    pixel(9, 34, 14, 1, a.pants);
    // A small neckline and seams make the compact block read as clothing.
    if (a.style === "short" || a.style === "glasses") {
      pixel(12, 28, 2, 1, a.light);
      pixel(14, 29, 4, 1, ink);
      pixel(18, 28, 2, 1, a.light);
      pixel(15, 30, 2, 4, ink);
      pixel(10, 31, 3, 1, a.light);
      pixel(19, 31, 3, 1, a.light);
    } else {
      pixel(13, 28, 6, 1, a.light);
    }
    // Two tiny stubs, with one-pixel steps rounding the ends of the shoes.
    for (const [x, lift] of [
      [9, Math.max(0, stride)],
      [18, -Math.min(0, stride)],
    ]) {
      pixel(x, 35 - lift, 6, 3, ink);
      pixel(x + 1, 35 - lift, 4, 2, a.pants);
      pixel(x, 38 - lift, 5, 1, ink);
      pixel(x + 1, 39 - lift, 3, 1, ink);
      pixel(x + 1, 37 - lift, 2, 1, "#96978b");
    }
    // Short sleeves, then small rounded hands, rather than long rectangular arms.
    for (const [x, swing] of [
      [4, Math.sign(stride)],
      [24, -Math.sign(stride)],
    ]) {
      pixel(x + 1, 27 + swing, 3, 1, ink);
      pixel(x, 28 + swing, 4, 5, ink);
      pixel(x + 1, 33 + swing, 2, 1, ink);
      pixel(x + 1, 28 + swing, 3, 2, a.color);
      pixel(x + 1, 28 + swing, 2, 1, a.light);
      pixel(x + 1, 30 + swing, 2, 3, a.skin);
      pixel(x + 1, 32 + swing, 1, 1, a.shade);
    }
    // Each contour narrows in several small steps, rather than a rectangular head.
    pen.save();
    pen.translate(0, -(pose % 2));
    bands(
      [
        [11, 2, 10, 1],
        [8, 3, 16, 2],
        [6, 5, 20, 2],
        [4, 7, 24, 4],
        [3, 11, 26, 8],
        [4, 19, 24, 3],
        [6, 22, 20, 3],
        [9, 25, 14, 2],
        [12, 27, 8, 1],
      ],
      ink
    );
    bands(
      [
        [11, 3, 10, 1],
        [8, 4, 16, 2],
        [6, 6, 20, 2],
        [5, 8, 22, 4],
        [4, 12, 24, 6],
        [5, 18, 22, 3],
        [7, 21, 18, 3],
        [10, 24, 12, 2],
      ],
      a.hair
    );
    if (facing !== "north") {
      const shift = facing === "east" ? 1 : facing === "west" ? -1 : 0;
      bands(
        [
          [9 + shift, 11, 14, 2],
          [7 + shift, 13, 18, 3],
          [6 + shift, 16, 20, 5],
          [7 + shift, 21, 18, 3],
          [9 + shift, 24, 14, 2],
          [12 + shift, 26, 8, 1],
        ],
        a.skin
      );
      bands(
        [
          [6 + shift, 17, 1, 4],
          [7 + shift, 21, 1, 2],
          [8 + shift, 23, 2, 1],
          [10 + shift, 25, 2, 1],
          [22 + shift, 23, 2, 1],
        ],
        a.shade
      );
      // Tiny ears sit low, beside the eyes.
      bands(
        [
          [2, 18, 3, 4],
          [3, 17, 2, 1],
          [27, 18, 3, 4],
          [27, 17, 2, 1],
        ],
        ink
      );
      pixel(3, 18, 2, 3, a.skin);
      pixel(27, 18, 2, 3, a.skin);
      pixel(3, 21, 2, 1, a.shade);
      pixel(27, 21, 2, 1, a.shade);
      // Eyes sit within the face, rather than against its outer contour.
      // Two faces use taller manga eyes; Josh and the cap use simple black eyes.
      const expressive = a.style === "long" || a.style === "short";
      const eyeXs = facing === "east" ? [19] : facing === "west" ? [10] : [10, 19];
      for (const eye of eyeXs) {
        const x = eye + shift;
        if (blink) {
          pixel(x, 22, 3, 1, ink);
          continue;
        }
        if (expressive) {
          pixel(x, 18, 4, 1, ink);
          pixel(x, 19, 4, 5, "#fff3dc");
          pixel(x + 1, 19, 3, 4, ink);
          pixel(x + 1, 22, 2, 2, a.style === "long" ? "#79512e" : "#466252");
          pixel(x + 1, 19, 1, 2, "#fff9e9");
          pixel(x + 1, 24, 2, 1, a.shade);
          if (a.style === "long") pixel(x - 1, 18, 1, 1, ink);
        } else if (a.style !== "glasses") {
          pixel(x + 1, 20, 3, 4, "#202122");
        }
      }
      if (a.style === "glasses") {
        // Smaller lenses gather around the eyes instead of spanning the whole head.
        for (const x of [7, 18]) {
          bands(
            [
              [x + 1, 18, 7, 1],
              [x, 19, 9, 5],
              [x + 1, 24, 7, 1],
            ],
            ink
          );
          pixel(x + 2, 20, 5, 3, "#b7c5b9");
          pixel(x + 2, 20, 2, 2, "#edf0df");
        }
        pixel(16, 20, 2, 2, ink);
      }
    } else {
      bands(
        [
          [6, 13, 20, 7],
          [7, 20, 18, 3],
          [10, 23, 12, 2],
        ],
        a.hair
      );
      bands(
        [
          [7, 14, 2, 6],
          [11, 23, 10, 1],
        ],
        a.hairLight
      );
    }
    // Hair follows the crown's curve; individual locks break up the edge.
    if (a.style === "curly") {
      bands(
        [
          [10, 1, 4, 2],
          [17, 1, 4, 2],
          [5, 5, 4, 3],
          [23, 6, 4, 3],
        ],
        ink
      );
      bands(
        [
          [9, 4, 4, 2],
          [15, 3, 4, 2],
          [21, 5, 3, 2],
          [6, 8, 3, 3],
          [23, 9, 3, 3],
        ],
        a.hairLight
      );
      bands(
        [
          [7, 10, 4, 5],
          [10, 10, 5, 3],
          [14, 10, 4, 4],
          [18, 10, 5, 3],
          [23, 12, 3, 5],
        ],
        a.hair
      );
      bands(
        [
          [10, 11, 3, 1],
          [19, 11, 3, 1],
        ],
        a.hairLight
      );
    } else if (a.style === "cap") {
      bands(
        [
          [10, 2, 12, 1],
          [7, 3, 18, 2],
          [5, 5, 22, 3],
          [4, 8, 24, 6],
          [5, 14, 22, 2],
          [7, 16, 18, 1],
        ],
        ink
      );
      bands(
        [
          [10, 3, 12, 1],
          [7, 4, 18, 2],
          [6, 6, 20, 3],
          [5, 9, 22, 4],
          [7, 13, 18, 2],
        ],
        a.color
      );
      bands(
        [
          [8, 5, 3, 2],
          [7, 7, 3, 4],
          [8, 12, 17, 1],
        ],
        a.light
      );
      pixel(15, 6, 5, 1, "#d8e5dc");
      pixel(14, 7, 2, 3, "#d8e5dc");
      pixel(16, 10, 4, 1, "#d8e5dc");
    } else if (a.style === "long") {
      bands(
        [
          [8, 7, 4, 7],
          [12, 7, 4, 5],
          [16, 7, 4, 6],
          [20, 8, 5, 8],
          [5, 12, 3, 10],
          [24, 15, 3, 9],
        ],
        a.hair
      );
      bands(
        [
          [9, 5, 2, 7],
          [14, 4, 2, 6],
          [20, 6, 2, 7],
          [6, 16, 1, 8],
          [25, 18, 1, 5],
        ],
        a.hairLight
      );
    } else {
      bands(
        [
          [12, 0, 6, 2],
          [10, 2, 10, 2],
        ],
        ink
      );
      pixel(13, 1, 4, 2, a.hairLight);
      bands(
        [
          [7, 8, 5, 5],
          [11, 9, 5, 5],
          [16, 9, 5, 6],
          [21, 9, 4, 5],
          [5, 13, 3, 4],
          [24, 13, 3, 4],
        ],
        a.hair
      );
      bands(
        [
          [8, 7, 2, 4],
          [13, 5, 2, 7],
          [18, 6, 2, 7],
          [23, 9, 1, 3],
        ],
        a.hairLight
      );
    }
    pen.restore();
    spriteCache.set(id, sprite);
    return sprite;
  }

  let world,
    frame = null,
    rebuildTimer,
    scrollTimer,
    lastTime = 0,
    lastPaint = 0;
  let age = 0,
    nextMeeting = 12,
    encounter = null,
    paused = false,
    journey = 0,
    meetings = 0;
  const agents = Array.from({ length: appearances.length }, (_, index) => ({
    index,
    x: 0,
    y: 0,
    node: null,
    path: [],
    active: index === 0,
    alpha: index === 0 ? 1 : 0,
    facing: "south",
    walking: false,
    rest: 0.7 + index * 0.8,
    blocked: 0,
  }));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const docRect = (element) => {
    const r = element.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top + scrollY, bottom: r.bottom + scrollY };
  };

  function paintTree(pen, x, y, scale = 1, dark = false) {
    const pixel = (dx, dy, w, h, color) => {
      pen.fillStyle = color;
      pen.fillRect(Math.round(x + dx * scale), Math.round(y + dy * scale), w * scale, h * scale);
    };
    const edge = dark ? "#254b3b" : "#3e6249";
    const leaf = dark ? "#527b56" : "#668655";
    const light = dark ? "#729364" : "#89a66b";
    pixel(3, 27, 15, 2, dark ? "#233b30" : "#a2b287");
    pixel(8, 18, 5, 10, "#76583e");
    pixel(9, 19, 2, 8, "#ab8153");
    pixel(5, 1, 10, 3, edge);
    pixel(3, 4, 14, 4, edge);
    pixel(1, 8, 18, 10, edge);
    pixel(3, 18, 14, 5, edge);
    pixel(6, 23, 8, 2, edge);
    pixel(5, 3, 9, 5, leaf);
    pixel(3, 8, 13, 10, leaf);
    pixel(6, 17, 10, 4, leaf);
    pixel(6, 4, 5, 3, light);
    pixel(4, 9, 5, 4, light);
    pixel(10, 14, 5, 3, light);
    pixel(3, 16, 3, 2, edge);
    pixel(13, 8, 3, 2, edge);
  }

  function buildEnvironment(bounds) {
    const dark = document.documentElement.dataset.theme === "dark";
    const props = [],
      obstacles = [];
    // One little tree on alternating sides, well outside the reading column.
    for (let y = bounds.top + 220, i = 0; y < bounds.bottom; y += 620, i++) {
      const x = i % 2 ? bounds.right + 130 : bounds.left - 160;
      if (x < 18 || x + 30 > innerWidth - 18) continue;
      props.push({ x, y });
      obstacles.push({ left: x, right: x + 30, top: y, bottom: y + 44 });
    }
    return { props, obstacles, dark };
  }

  function paintEnvironment() {
    const { environment } = world;
    ctx.globalAlpha = ambientOpacity;
    for (const prop of environment.props) {
      const y = prop.y - scrollY;
      if (y < -50 || y > innerHeight + 20) continue;
      paintTree(ctx, prop.x, y, 1.5, environment.dark);
    }
    ctx.globalAlpha = 1;
  }

  function clearPoint(x, y) {
    if (x < world.half + 3 || x > world.width - world.half - 3 || y < world.top || y > world.bottom) return false;
    return !world.obstacles.some(
      (r) => x + world.half + 2 > r.left && x - world.half - 2 < r.right && y > r.top - 2 && y - world.spriteHeight < r.bottom + 2
    );
  }

  function clearSegment(a, b) {
    // The full sprite footprint, not just its feet, must stay outside readable content.
    const left = Math.min(a.x, b.x) - world.half - 2;
    const right = Math.max(a.x, b.x) + world.half + 2;
    const top = Math.min(a.y, b.y) - world.spriteHeight;
    const bottom = Math.max(a.y, b.y);
    return !world.obstacles.some((r) => right > r.left && left < r.right && bottom > r.top - 2 && top < r.bottom + 2);
  }

  function visibleNode(node) {
    return node.y > scrollY + world.nav + world.spriteHeight + 12 && node.y < scrollY + innerHeight - 24;
  }

  function nearest(x, y, filter = () => true) {
    return world.nodes.filter(filter).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
  }

  function route(start, end) {
    if (!start || !end) return null;
    if (start.id === end.id) return [];
    const cost = new Map([[start.id, 0]]),
      previous = new Map(),
      pending = new Set([start.id]);
    while (pending.size) {
      const id = [...pending].reduce((best, next) => (cost.get(next) < cost.get(best) ? next : best));
      pending.delete(id);
      if (id === end.id) {
        const result = [];
        let current = end;
        while (current.id !== start.id) {
          result.unshift(current);
          current = world.nodes[previous.get(current.id)];
        }
        return result;
      }
      for (const neighbor of world.nodes[id].edges) {
        const nextCost = cost.get(id) + distance(world.nodes[id], world.nodes[neighbor]);
        if (nextCost >= (cost.has(neighbor) ? cost.get(neighbor) : Infinity)) continue;
        cost.set(neighbor, nextCost);
        previous.set(neighbor, id);
        pending.add(neighbor);
      }
    }
    return null;
  }

  function assign(agent, target) {
    const path = route(agent.node, target);
    if (path === null) return false;
    agent.path = path;
    return true;
  }

  function settleAt(agent, node) {
    if (!node) {
      agent.active = false;
      return;
    }
    agent.x = node.x;
    agent.y = node.y;
    agent.node = node;
    agent.path = [];
    agent.walking = false;
    agent.facing = "south";
  }

  function rebuild() {
    const bounds = docRect(page),
      narrow = innerWidth < 900;
    const spriteHeight = narrow ? 32 : 40,
      half = Math.ceil(spriteHeight * 0.4);
    const navbar = document.querySelector(".navbar");
    const nav = navbar ? navbar.getBoundingClientRect().bottom : 56;
    const obstacles = [
      ...page.querySelectorAll("p,h1,h2,h3,h4,table,.profile,.thesis-callout,.democracy-talk-feature,.card,.publications .row,.contact-icons,button"),
    ]
      .filter((el) => el.getClientRects().length)
      .map(docRect);
    const landmarks = [...page.querySelectorAll(".post-header,.profile,.thesis-callout,.democracy-talk-feature,article > h2,.social")]
      .filter((el) => el.getClientRects().length)
      .map(docRect);
    const xs = [
      ...new Set(
        [
          Math.max(half + 4, bounds.left - 84),
          Math.max(half + 4, bounds.left - 30),
          bounds.left + 28,
          bounds.left + 88,
          (bounds.left + bounds.right) / 2,
          bounds.right - 88,
          bounds.right - 28,
          Math.min(innerWidth - half - 4, bounds.right + 30),
          Math.min(innerWidth - half - 4, bounds.right + 84),
        ].map(Math.round)
      ),
    ];
    const landmarkYs = landmarks.flatMap((r) => [Math.round(r.top - 2), Math.round(r.bottom + spriteHeight + 4)]);
    const ys = [
      ...new Set([
        ...landmarkYs,
        ...landmarkYs.flatMap((y) => [y - 52, y + 52]),
        ...Array.from({ length: Math.ceil((bounds.bottom - bounds.top) / 60) }, (_, i) => Math.round(bounds.top + 40 + i * 60)),
      ]),
    ].sort((a, b) => a - b);
    const environment = buildEnvironment(bounds, landmarks);
    obstacles.push(...environment.obstacles);
    world = { width: innerWidth, nav, top: bounds.top, bottom: bounds.bottom - 12, half, spriteHeight, obstacles, nodes: [], narrow, environment };
    const columns = new Map(),
      rows = new Map();
    for (const y of ys)
      for (const x of xs) {
        if (!clearPoint(x, y)) continue;
        const node = { id: world.nodes.length, x, y, edges: [], landmark: landmarkYs.includes(y) };
        world.nodes.push(node);
        if (!columns.has(x)) columns.set(x, []);
        if (!rows.has(y)) rows.set(y, []);
        columns.get(x).push(node);
        rows.get(y).push(node);
      }
    for (const [groups, axis] of [
      [columns, "y"],
      [rows, "x"],
    ]) {
      for (const nodes of groups.values()) {
        nodes.sort((a, b) => a[axis] - b[axis]);
        for (let i = 1; i < nodes.length; i++)
          if (clearSegment(nodes[i - 1], nodes[i])) {
            nodes[i - 1].edges.push(nodes[i].id);
            nodes[i].edges.push(nodes[i - 1].id);
          }
      }
    }
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    ctx.imageSmoothingEnabled = false;
    encounter = null;
    const photo = docRect(page.querySelector(".profile") || page);
    const placed = [];
    agents.forEach((agent, i) => {
      agent.active = i < (motion.matches ? 1 : narrow ? 3 : 5);
      if (!agent.active) {
        agent.path = [];
        return;
      }
      const x = i % 2 ? bounds.left - (i === 3 ? 84 : 30) : bounds.right + (i === 2 ? 84 : 30);
      const y = photo.top + 40 + i * 130;
      const node = nearest(
        x,
        Math.min(y, scrollY + innerHeight - 50),
        (n) => visibleNode(n) && n.edges.length && placed.every((p) => distance(p, n) > 60)
      );
      settleAt(agent, node);
      if (node) placed.push(node);
      agent.alpha = 1;
      agent.rest = 0.7 + i * 0.8;
      agent.blocked = 0;
    });
    render();
    schedule();
  }

  function chooseWalk(agent) {
    const candidates = world.nodes.filter(
      (n) =>
        visibleNode(n) &&
        distance(n, agent) > 42 &&
        distance(n, agent) < 420 &&
        n.edges.length &&
        agents.every((a) => !a.active || a === agent || distance(a, n) > 44)
    );
    // Prefer section edges; sometimes use the outer margin to move to the next section.
    candidates.sort((a, b) => Number(b.landmark) - Number(a.landmark));
    const choices = candidates.slice(0, 20);
    const offset = journey++ % Math.max(1, choices.length);
    for (let i = 0; i < choices.length; i++) {
      const target = choices[(offset + i) % choices.length];
      if (assign(agent, target) && agent.path.length) return;
    }
    agent.rest = 1.5;
  }

  function startEncounter() {
    const idle = agents.filter((a) => a.active && !a.path.length);
    for (const host of idle) {
      for (const peer of agents.filter((a) => a.active)) {
        if (peer === host || distance(host, peer) > 360) continue;
        const targets = world.nodes.filter((n) => visibleNode(n) && distance(n, host) >= 44 && distance(n, host) <= 80 && clearSegment(host, n));
        for (const target of targets) {
          const origin = peer.path[0] || peer.node;
          const path = route(origin, target);
          if (path === null) continue;
          if (distance(peer, origin) > 0.01) path.unshift(origin);
          const length = path.reduce((sum, n, i) => sum + distance(i ? path[i - 1] : peer, n), 0);
          if (length > 360) continue;
          peer.path = path;
          encounter = { elapsed: 0, travel: 0, participants: [host.index, peer.index] };
          meetings++;
          return true;
        }
      }
    }
    return false;
  }

  function move(agent, dt) {
    agent.walking = agent.path.length > 0;
    if (!agent.walking) return;
    const target = agent.path[0],
      dx = target.x - agent.x,
      dy = target.y - agent.y;
    const remaining = Math.hypot(dx, dy),
      step = Math.min(remaining, dt * (agent.index ? 30 : 25));
    const proposed = { x: agent.x + (dx / (remaining || 1)) * step, y: agent.y + (dy / (remaining || 1)) * step };
    // A brief yield, then backtrack to let another companion pass.
    if (
      agents.some(
        (other) =>
          other !== agent &&
          other.active &&
          other.alpha > 0.5 &&
          distance(other, proposed) < world.half * 2 + 4 &&
          distance(other, proposed) < distance(other, agent) &&
          (other.index < agent.index || !other.walking)
      )
    ) {
      agent.walking = false;
      agent.blocked += dt;
      if (agent.blocked > 1.5) {
        if (encounter && encounter.participants.includes(agent.index)) finishEncounter();
        agent.path = distance(agent, agent.node) > 1 ? [agent.node] : [];
        agent.rest = 0.8;
        agent.blocked = 0;
      }
      return;
    }
    agent.blocked = 0;
    if (!clearPoint(proposed.x, proposed.y)) {
      agent.path = [];
      agent.walking = false;
      return;
    }
    agent.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "east" : "west") : dy > 0 ? "south" : "north";
    agent.x = proposed.x;
    agent.y = proposed.y;
    if (remaining <= step + 0.01) {
      agent.node = target;
      agent.path.shift();
    }
  }

  function finishEncounter() {
    encounter = null;
    nextMeeting = age + 12;
    agents.forEach((a) => {
      a.rest = 0.8 + a.index * 0.3;
    });
  }

  function maintainViewport() {
    if (!world || motion.matches) return;
    for (const agent of agents.filter((a) => a.active)) {
      if (agent.y >= scrollY + world.nav && agent.y <= scrollY + innerHeight + 80) continue;
      // Re-enter only after leaving view, never dragging a character across text.
      const target = nearest(
        agent.x,
        scrollY + innerHeight * (0.25 + agent.index * 0.12),
        (n) => visibleNode(n) && n.edges.length && agents.every((a) => !a.active || a === agent || distance(n, a) > 44)
      );
      if (!target) continue;
      settleAt(agent, target);
      agent.alpha = 0;
      agent.rest = 0.8;
      finishEncounter();
    }
    schedule();
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!world) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, world.nav + 2, canvas.width, canvas.height - world.nav);
    ctx.clip();
    paintEnvironment();
    agents
      .filter((a) => a.active)
      .sort((a, b) => a.y - b.y)
      .forEach((agent) => {
        const x = Math.round(agent.x),
          y = Math.round(agent.y - scrollY);
        if (y < 0 || y > innerHeight + world.spriteHeight) return;
        ctx.globalAlpha = agent.alpha * ambientOpacity;
        const h = world.spriteHeight,
          w = h * 0.8;
        ctx.fillStyle = "rgba(41,43,37,0.17)";
        ctx.fillRect(x - w / 3, y - 2, (w * 2) / 3, 3);
        const pose = agent.walking ? Math.floor(age * 6) % 4 : 0;
        ctx.drawImage(personSprite(agent.index, agent.walking ? agent.facing : "south", pose, false), Math.round(x - w / 2), y - h, w, h);
        if (agent.index === 0 && age < 7 && !world.narrow) {
          ctx.font = '12px "JetBrains Mono", monospace';
          ctx.textAlign = "center";
          ctx.fillStyle = "#faf3e3";
          ctx.fillRect(x - 19, y - h - 16, 38, 14);
          ctx.fillStyle = "#176b68";
          ctx.fillText("Josh", x, y - h - 5);
        }
      });
    if (encounter && encounter.participants.every((i) => !agents[i].path.length)) {
      const active = encounter.participants.map((i) => agents[i]);
      const sender = Math.floor(encounter.elapsed / 1.6) % active.length;
      const from = active[sender],
        to = active[(sender + 1) % active.length];
      const progress = (encounter.elapsed % 1.6) / 1.6;
      // A tiny shared note crosses the safe gap: a visual hint of coordination, without a dashboard.
      const x = from.x + (to.x - from.x) * progress;
      const y = from.y + (to.y - from.y) * progress - scrollY - 8;
      ctx.globalAlpha = Math.sin(progress * Math.PI) * ambientOpacity;
      ctx.fillStyle = "#293c35";
      ctx.fillRect(Math.round(x - 4), Math.round(y - 3), 8, 7);
      ctx.fillStyle = "#faf3e3";
      ctx.fillRect(Math.round(x - 3), Math.round(y - 2), 6, 5);
      ctx.fillStyle = "#d9a747";
      ctx.fillRect(Math.round(x - 2), Math.round(y - 1), 4, 1);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function tick(time) {
    frame = null;
    const dt = Math.min((time - lastTime) / 1000 || 0, 0.05);
    lastTime = time;
    age += dt;
    agents
      .filter((a) => a.active)
      .forEach((agent) => {
        agent.alpha = Math.max(0, Math.min(1, agent.alpha + dt));
        move(agent, dt);
      });
    if (encounter) {
      if (encounter.participants.some((i) => agents[i].path.length)) {
        encounter.travel += dt;
        if (encounter.travel > 16) finishEncounter();
      } else {
        encounter.elapsed += dt;
        if (encounter.elapsed > 4.8) finishEncounter();
      }
    } else if (age > nextMeeting) startEncounter();
    for (const agent of agents.filter((a) => a.active)) {
      if (agent.path.length || (encounter && encounter.participants.includes(agent.index))) continue;
      agent.rest -= dt;
      if (agent.rest <= 0) {
        chooseWalk(agent);
        agent.rest = 1 + agent.index * 0.2;
      }
    }
    if (time - lastPaint > 1000 / 24) {
      render();
      lastPaint = time;
    }
    if (!paused && !motion.matches && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function schedule() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    toggle.hidden = motion.matches || !(world && world.nodes.length);
    toggle.textContent = paused ? "Resume page companions" : "Pause page companions";
    if (world && world.nodes.length && !paused && !motion.matches && !document.hidden) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
    render();
  }

  toggle.addEventListener("click", () => {
    paused = !paused;
    schedule();
  });
  motion.addEventListener("change", rebuild);
  document.addEventListener("visibilitychange", schedule);
  addEventListener(
    "scroll",
    () => {
      render();
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(maintainViewport, 180);
    },
    { passive: true }
  );
  const queueRebuild = () => {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(rebuild, 150);
  };
  addEventListener("resize", queueRebuild);
  if ("ResizeObserver" in window) new ResizeObserver(queueRebuild).observe(page);
  new MutationObserver(queueRebuild).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (document.fonts) document.fonts.ready.then(queueRebuild);
  rebuild();
})();
