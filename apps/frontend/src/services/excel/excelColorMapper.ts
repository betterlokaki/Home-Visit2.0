interface StatusColorMap {
  [key: string]: string;
}

const STATUS_COLORS: StatusColorMap = {
  red: 'd32029',
  yellow: 'd89614',
  orange: 'ea580c',
  green: '16a34a',
  blue: '1668dc',
  purple: '9333ea',
};

export function getStatusColor(color: string): string {
  return STATUS_COLORS[color] || STATUS_COLORS.yellow;
}

