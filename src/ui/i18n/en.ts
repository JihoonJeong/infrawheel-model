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

  // Landing
  'landing.navSimulator': 'Simulator',
  'landing.eyebrow': 'AI Industry Flywheel Simulator',
  'landing.title': 'The AI industry is an engine.\nInfraWheel shows you how it spins.',
  'landing.subtitle': 'Explore 19 variables that drive the cycle — from silicon to capital and back. Move the sliders, see the future.',
  'landing.cta': 'Launch Simulator',
  'landing.statNodes': 'Nodes',
  'landing.statParams': 'Parameters',
  'landing.statQuarters': 'Quarters',
  'landing.statLoops': 'Loops',
  'landing.loopsTitle': 'Two Loops',
  'landing.hyperscaleTitle': 'Hyperscale Loop',
  'landing.hyperscaleDesc': 'Already spinning. Trains AI models in massive data centers, delivers cloud services, generates revenue. The engine you can already hear.',
  'landing.spatialTitle': 'Spatial Loop',
  'landing.spatialDesc': 'Approaching activation. AI-RAN base stations and 6G infrastructure bring inference to the physical world — robots, vehicles, everything.',
  'landing.nodesTitle': 'Eight Nodes, One Engine',
  'landing.nodeSilicon': 'Memory and packaging — the physical ceiling of AI compute.',
  'landing.nodeEnergy': 'Not generation but delivery. Lead time determines wheel speed.',
  'landing.nodeHyperscale': 'Converts chips + power into effective compute. Depth.',
  'landing.nodeSpatial': 'Blankets physical space with inference. Reach.',
  'landing.nodeIntelligence': 'Where both engines meet. Pure SW lever for both loops.',
  'landing.nodeDigital': 'SaaS displacement + AI-native creation. Cloud revenue.',
  'landing.nodePhysical': 'Robots, AVs, smart infra. Real-economy revenue.',
  'landing.nodeCapital': 'Cash flows back to silicon. The joint that closes the loop.',
  'landing.howTitle': 'How It Works',
  'landing.step1': 'Adjust any of the 19 parameters — memory supply, power delivery, algorithmic efficiency, and more.',
  'landing.step2': 'Watch the flywheel respond in real time. See which node becomes the bottleneck, how confidence shifts.',
  'landing.step3': 'Explore scenarios: What if energy stalls? What if Korea leads spatial? The timeline shows you 10 years ahead.',
  'landing.bottomTagline': 'The gap between the two loops is where the investment timing lives.',
  'landing.footer': 'Based on the InfraWheel framework from "AI Investment Map in a Day" by Jihoon Jeong (JJ). Published by Hanbit Media.',
  'landing.backToHome': '← Back',
} as const;

export type TranslationKey = keyof typeof en;
