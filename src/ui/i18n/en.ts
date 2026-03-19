export const en = {
  // Header
  appTitle: 'InfraWheel Simulator',
  phaseBadge: 'Phase 2 Preview',
  langToggle: '한',

  // Parameter panel
  parameters: 'Parameters',
  reset: 'Reset',

  // Node groups
  'node.silicon': 'Silicon',
  'node.energy': 'Energy',
  'node.hyperscaleDC': 'Hyperscale DC',
  'node.spatialCompute': 'Spatial Compute',
  'node.intelligence': 'Intelligence',
  'node.digitalAI': 'Digital AI',
  'node.physicalAI': 'Physical AI',
  'node.capital': 'Capital',

  // Silicon params
  'param.bwMemory': 'BW Memory Supply',
  'param.capMemory': 'Capacity Memory Pool',
  'param.packaging': 'Packaging Throughput',

  // Energy params
  'param.deliverablePower': 'Deliverable Power',
  'param.leadTime': 'Pipeline Lead Time',
  'param.computeDensity': 'Compute Density',

  // Hyperscale DC params
  'param.bisectionBW': 'Bisection BW',
  'param.utilization': 'Utilization',

  // Spatial Compute params
  'param.deploymentRate': 'AI-RAN Deploy Rate',
  'param.perNodeTOPS': 'Per-node Capacity',

  // Intelligence params
  'param.algorithmicEfficiency': 'Algorithmic Efficiency',
  'param.transferRatio': 'Frontier→Edge Transfer',

  // Digital AI params
  'param.revenueGrowth': 'Revenue Growth',
  'param.grossMargin': 'Gross Margin',

  // Physical AI params
  'param.fleetDeployment': 'Fleet Deployment',
  'param.unitEconomics': 'Unit Economics',

  // Capital params
  'param.reinvestRatio': 'Reinvestment Ratio',
  'param.policyCAPEX': 'Policy CAPEX',

  // Timeline chart
  timelineProjection: 'Timeline Projection',

  // Metrics
  'metric.totalRevenue': 'Total AI Revenue ($B/Q)',
  'metric.totalCAPEX': 'Total CAPEX ($B/Q)',
  'metric.bottleneckRatio': 'Bottleneck Ratio',
  'metric.digitalRevenue': 'Digital AI Revenue ($B/Q)',
  'metric.physicalRevenue': 'Physical AI Revenue ($B/Q)',
  'metric.hyperscaleEffective': 'Hyperscale Effective Compute',
  'metric.spatialEffective': 'Spatial Effective Compute',
  'metric.frontierCapability': 'Frontier Capability',
  'metric.confidence': 'Market Confidence',

  // Diagram
  infrawheel: 'InfraWheel',
  bottleneck: 'Bottleneck',
  bottleneckRatioLabel: 'Bottleneck Ratio',
  confidenceLabel: 'Confidence',
  hyperscaleLoop: 'Hyperscale Loop',
  spatialLoop: 'Spatial Loop',
  physicalAIStatus: 'Physical AI',
  active: 'ACTIVE',
  inactive: 'Inactive',

  // Diagram nodes (wheel)
  'wheel.silicon': 'Silicon',
  'wheel.energy': 'Energy',
  'wheel.hyperscale': 'Hyperscale',
  'wheel.spatial': 'Spatial',
  'wheel.intelligence': 'Intelligence',
  'wheel.digital': 'Digital AI',
  'wheel.physical': 'Physical AI',
  'wheel.capital': 'Capital',

  // Scenarios
  scenario: 'Scenario',
  'scenario.base2026': 'Base Case 2026',
  'scenario.energyBottleneck': 'Energy Bottleneck',
  'scenario.aiWinter': 'AI Winter',
  'scenario.koreaFirstSpatial': 'Korea-first Spatial',
  'scenario.algoBreakthrough': 'Algorithmic Breakthrough',
  'scenario.memoryWall': 'Memory Wall',
  'scenario.physicalAITakeoff': 'Physical AI Takeoff',
  'scenario.policyBoostKorea': 'Policy Boost (Korea)',
} as const;

export type TranslationKey = keyof typeof en;
