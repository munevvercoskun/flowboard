/**
 * The Strategy pattern: interchangeable ways to order the cards in a column.
 *
 * The card-listing endpoint picks one of these by name (?order=priority). Adding
 * a new ordering is adding one entry to this map -- the route and the services
 * don't change. Each strategy is a pure function (cards -> sorted cards), which
 * also makes them trivial to test in isolation.
 */
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export const orderingStrategies = {
  created: (cards) => [...cards].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  priority: (cards) => [...cards].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]),
  title: (cards) => [...cards].sort((a, b) => a.title.localeCompare(b.title)),
};

export function orderCards(cards, strategyName = 'created') {
  const strategy = orderingStrategies[strategyName];
  if (!strategy) {
    throw new Error(`unknown ordering '${strategyName}', try one of: ${Object.keys(orderingStrategies).join(', ')}`);
  }
  return strategy(cards);
}
