import Phaser from 'phaser';
import { ALBEDOS, BASE_CAMERA, MODE_LABEL, TONES, gaugeFor, stops, type CardTone } from '../exposure';
import { game } from '../gameStore.svelte';

const AMBER = 0xf3ae31;
const AMBER_SOFT = 0xf7c96e;
const MUTED = 0x9bb0b9;
const CLIMAX = 0xdf4a42;
const CARD_BAND = 0x101a1e;

export class BasePlateauScene extends Phaser.Scene {
  private drawing?: Phaser.GameObjects.Graphics;
  private pulse?: Phaser.GameObjects.Graphics;
  private labels: Phaser.GameObjects.Text[] = [];
  private hitAreas: Phaser.GameObjects.Zone[] = [];
  private pulseAt: { x: number; y: number; w: number; h: number } | null = null;
  private readonly inactive: boolean;

  constructor(inactive = false) {
    super('plateau');
    this.inactive = inactive;
  }

  create() {
    this.drawing = this.add.graphics();
    this.pulse = this.add.graphics();
    this.scale.on('resize', () => this.draw());
    this.draw();
  }

  /** Anneau pulsé posé sur l'élément que le joueur doit utiliser maintenant. */
  update() {
    const g = this.pulse;
    if (!g) return;
    g.clear();
    if (!this.pulseAt) return;
    const phase = (this.time.now % 1500) / 1500;
    const grow = 2 + phase * 9;
    g.lineStyle(2, AMBER, 0.85 - phase * 0.65);
    g.strokeRoundedRect(this.pulseAt.x - grow, this.pulseAt.y - grow, this.pulseAt.w + grow * 2, this.pulseAt.h + grow * 2, 12);
  }

  draw() {
    const w = this.scale.width;
    const h = this.scale.height;
    if (!w || !h) return;
    const g = this.drawing!;
    const size = Math.max(9, Math.round(11 * Math.max(0.78, Math.min(1, w / 720))));
    const head = Math.round(size * 1.25);

    g.clear();
    this.labels.forEach((label) => label.destroy());
    this.labels = [];
    this.hitAreas.forEach((area) => area.destroy());
    this.hitAreas = [];
    this.pulseAt = null;

    g.fillStyle(0x101a21, 1).fillRoundedRect(0, 0, w, h, 22);
    g.lineStyle(1, 0x30424c, 1).strokeRoundedRect(1, 1, w - 2, h - 2, 22);

    const incident = game.sphere === 'in';
    const cardY = h * 0.83;
    const source = { x: w * 0.13, y: h * 0.27 };
    const subject = { x: w * 0.64, y: h * 0.38 };
    const meter = { x: w * 0.19, y: h * 0.58 };

    this.drawSource(g, source, incident, size);
    this.drawBeam(g, incident ? source : subject, meter, incident);
    this.drawSubject(g, subject, size);
    this.drawMeter(g, meter, incident, size);
    this.drawModeHeader(g, w, size, incident);
    this.drawPreview(g, w * 0.45, h * 0.13, size);
    TONES.forEach((tone, index) => this.drawCard(g, w * (0.36 + index * 0.2), cardY, tone, size));
    this.drawGauge(g, w * 0.955, size);
    this.drawLock(g, w * 0.79, h * 0.055, size);
    this.drawFooter(g, w, h, head, size);
  }

  private drawSource(g: Phaser.GameObjects.Graphics, at: { x: number; y: number }, incident: boolean, size: number) {
    const far = this.scale.width * 0.93;
    g.fillStyle(AMBER, incident ? 0.22 : 0.09);
    g.fillTriangle(at.x + 40, at.y, far, at.y - this.scale.height * 0.5, far, at.y + this.scale.height * 0.5);
    g.fillStyle(0xf1a624, 1).fillCircle(at.x, at.y, 30);
    g.fillStyle(0xffd37b, 1).fillCircle(at.x, at.y, 16);
    this.text(at.x - 34, at.y + 42, 'SOURCE', AMBER_SOFT, size);
    if (incident) this.text(at.x - 40, at.y + 58, 'c’est elle qu’on vise', 0x8fa5aa, size - 2);
  }

  private drawSubject(g: Phaser.GameObjects.Graphics, at: { x: number; y: number }, size: number) {
    const r = Math.max(32, this.scale.height * 0.19);
    g.fillStyle(0x24323a, 1).fillCircle(at.x, at.y, r);
    g.fillStyle(0x2e3f48, 1).fillCircle(at.x - r * 0.24, at.y - r * 0.26, r * 0.4);
    g.fillStyle(CLIMAX, 1).fillCircle(at.x + r * 0.5, at.y - r * 0.44, 9);
    this.text(at.x - 40, at.y + r + 12, 'SUJET', 0xdbe5e8, size);
    this.text(at.x - 40, at.y + r + 28, 'point rouge = climax', CLIMAX, size - 2);
  }

  /** Le faisceau dit ce que le posemètre est en train d'intégrer. */
  private drawBeam(g: Phaser.GameObjects.Graphics, from: { x: number; y: number }, to: { x: number; y: number }, incident: boolean) {
    g.fillStyle(incident ? AMBER : 0x8fa5aa, incident ? 0.14 : 0.1);
    g.fillTriangle(from.x - 6, from.y - 12, from.x - 6, from.y + 12, to.x, to.y);
  }

  private drawMeter(g: Phaser.GameObjects.Graphics, at: { x: number; y: number }, incident: boolean, size: number) {
    g.fillStyle(0x405158, 1).fillRoundedRect(at.x - 29, at.y - 38, 58, 76, 12);
    g.fillStyle(0x0a1013, 1).fillRoundedRect(at.x - 20, at.y - 18, 40, 23, 3);
    const value = game.reading;
    if (value !== null) {
      const ratio = Math.max(0.08, Math.min(1, (value - 6) / 6));
      g.fillStyle(AMBER, 1).fillRect(at.x - 16, at.y - 12, 32 * ratio, 5);
    }
    g.fillStyle(incident ? 0xf4c55d : 0x80939b, 1).fillCircle(at.x, at.y - (incident ? 30 : 47), incident ? 11 : 19);
    this.text(at.x - 52, at.y + 46, 'POSEMÈTRE', 0xdbe5e8, size);
    this.text(at.x - 52, at.y + 62, incident ? 'vise la source' : 'vise le carton', incident ? 0xf4c55d : MUTED, size - 2);
    this.hit(at.x, at.y, 88, 130, () => {
      if (!this.inactive) game.measure();
    });
    if (game.nextAction.target === 'sphere') this.pulseAt = { x: at.x - 34, y: at.y - 52, w: 68, h: 106 };
  }

  private drawModeHeader(g: Phaser.GameObjects.Graphics, w: number, size: number, incident: boolean) {
    const x = w * .49;
    const label = incident ? 'INCIDENTE  ·  le posemètre regarde la source' : 'RÉFLÉCHIE  ·  le posemètre regarde le carton';
    const color = incident ? AMBER : 0x9bb0b9;
    g.fillStyle(incident ? 0x3b2b0e : 0x192a33, 1).fillRoundedRect(x - 142, 18, 284, 34, 17);
    g.lineStyle(1, color, .75).strokeRoundedRect(x - 142, 18, 284, 34, 17);
    this.text(x - 122, 29, label, color, size);
  }

  private drawPreview(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number) {
    const { jpeg, raw } = game.preview;
    const tone = jpeg === 'cramé' ? 0xf3f0e6 : jpeg === 'sombre' ? 0x1b262c : jpeg === 'normale' ? 0x9aa7a6 : 0x283c42;
    g.fillStyle(0x283c42, 1).fillRoundedRect(x - 48, y - 26, 96, 58, 7);
    g.fillStyle(tone, 0.9).fillRect(x - 44, y - 22, 88, 46);
    g.fillStyle(0xf0ac30, jpeg === 'sombre' ? 0.35 : 0.7).fillCircle(x + 18, y - 4, 13);
    g.fillStyle(0x17252d, 0.85).fillTriangle(x - 38, y + 20, x - 2, y - 8, x + 32, y + 20);
    this.text(x - 48, y + 36, `JPEG ${jpeg} · RAW ${raw}`, jpeg === 'cramé' ? CLIMAX : 0xb9c9cc, size - 2);
  }

  private drawCard(g: Phaser.GameObjects.Graphics, x: number, y: number, tone: CardTone, size: number) {
    const value = game.readings[tone];
    const swatch = Phaser.Display.Color.HexStringToColor(ALBEDOS[tone].swatch).color;
    g.fillStyle(swatch, 1).fillRoundedRect(x - 48, y - 34, 96, 68, 7);
    g.lineStyle(value === null ? 1 : 2, value === null ? 0x5d747d : AMBER, 1).strokeRoundedRect(x - 48, y - 34, 96, 68, 7);
    g.fillStyle(CARD_BAND, value === null ? 0.35 : 0.82).fillRect(x - 47, y + 2, 94, 31);
    this.text(x - 42, y + 7, value === null ? 'à mesurer' : stops(value), value === null ? MUTED : 0xffffff, size + 1);
    this.text(x - 42, y + 23, `${ALBEDOS[tone].label} · ${ALBEDOS[tone].share}`, 0xb9c9cc, size - 2);
    this.text(x - 33, y - 52, ALBEDOS[tone].label.toUpperCase(), swatch === 0x16191c ? 0xc3ced1 : 0xaebec3, size - 1);
    this.hit(x, y, 112, 92, () => {
      if (this.inactive) game.select(tone);
      else game.measure(tone);
    });
    if (game.nextAction.target === `card:${tone}`) this.pulseAt = { x: x - 48, y: y - 34, w: 96, h: 68 };
  }

  /** Jauge graduée : les trois mesures y sont plaquées, la zone correcte est encadrée. */
  private drawGauge(g: Phaser.GameObjects.Graphics, x: number, size: number) {
    const height = this.scale.height;
    const top = height * 0.24;
    const bottom = height * 0.72;
    const { min, max, marks, target } = gaugeFor(game.readings);
    const toY = (ev: number) => bottom - ((ev - min) / (max - min)) * (bottom - top);

    g.fillStyle(0x0a1014, 1).fillRoundedRect(x - 9, top, 18, bottom - top, 9);
    g.fillStyle(0x24323a, 1).fillRect(x - 9, toY(target[1]), 18, Math.max(2, toY(target[0]) - toY(target[1])));
    for (let ev = min; ev <= max; ev += 1) {
      const y = toY(ev);
      g.fillStyle(0x40565f, 1).fillRect(x + 9, y - 0.5, ev % 2 === 0 ? 7 : 4, 1);
      if (ev % 2 === 0) this.text(x - 24, y - 5, String(ev), MUTED, size - 2);
    }
    marks.forEach(({ ev, tone }) => {
      const y = toY(ev);
      g.fillStyle(0xffffff, 1).fillRect(x - 13, y - 1, 26, 2);
      g.fillStyle(tone === 'noir' ? 0xdfe8ea : Phaser.Display.Color.HexStringToColor(ALBEDOS[tone].swatch).color, 1);
      g.fillRect(x - 13, y - 1, 6, 2);
    });
    this.text(x - 20, bottom + 8, 'IL', MUTED, size - 2);
  }

  private drawLock(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number) {
    const open = game.unlocked;
    g.fillStyle(open ? AMBER : 0x33454e, 1).fillRoundedRect(x - 34, y - 14, 68, 28, 8);
    g.lineStyle(3, open ? AMBER_SOFT : 0x8fa5aa, 1);
    g.beginPath();
    g.arc(x + (open ? 9 : 0), y - 16, 8, Math.PI, 0, false);
    g.strokePath();
    if (open) g.fillStyle(AMBER, 1).fillRect(x + 2, y - 16, 2, 8);
    this.text(x - 26, y - 7, open ? 'OUVERT' : 'FERMÉ', open ? 0x14181a : 0xb9c9cc, size - 1);
  }

  private drawFooter(g: Phaser.GameObjects.Graphics, w: number, h: number, head: number, size: number) {
    this.text(w * 0.08, h * 0.93, `${MODE_LABEL[game.mode]} · boîtier f/${BASE_CAMERA.f} ${BASE_CAMERA.shutterLabel} ISO ${BASE_CAMERA.iso}`, MUTED, head);
    this.text(w * 0.08, h * 0.965, 'Les cartons et le posemètre sont actifs · source et sujet servent de repères', 0x7e9299, size - 2);
  }

  private text(x: number, y: number, content: string, color: number, size: number) {
    const label = this.add.text(x, y, content, {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: `${Math.max(8, size)}px`,
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: '700'
    });
    this.labels.push(label);
  }

  private hit(x: number, y: number, width: number, height: number, action: () => void) {
    const area = this.add.zone(x, y, width, height).setInteractive({ useHandCursor: true });
    area.once('pointerdown', action);
    this.hitAreas.push(area);
  }
}
