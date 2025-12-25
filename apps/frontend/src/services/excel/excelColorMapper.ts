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
  if (!STATUS_COLORS[color]) {
    throw new Error(`Invalid status color: ${color}. Valid colors are: ${Object.keys(STATUS_COLORS).join(', ')}`);
  }
  return STATUS_COLORS[color];
}

