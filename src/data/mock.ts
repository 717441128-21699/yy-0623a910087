import type { Patient, BondingTask, FollowUpRecord, MaterialCheckItem } from '@/types'

export const mockPatients: Patient[] = [
  {
    id: 'p001',
    name: '张小明',
    gender: '男',
    age: 28,
    phone: '138****5678',
    caseNumber: 'ZZ2024001',
    treatmentStage: '第12副/共24副',
    nextVisitDate: '2024-06-20',
    avatar: 'https://picsum.photos/id/1005/100/100'
  },
  {
    id: 'p002',
    name: '李婷婷',
    gender: '女',
    age: 24,
    phone: '139****2345',
    caseNumber: 'ZZ2024002',
    treatmentStage: '第8副/共20副',
    nextVisitDate: '2024-06-21',
    avatar: 'https://picsum.photos/id/1027/100/100'
  },
  {
    id: 'p003',
    name: '王大伟',
    gender: '男',
    age: 32,
    phone: '137****8901',
    caseNumber: 'ZZ2024003',
    treatmentStage: '第5副/共18副',
    nextVisitDate: '2024-06-22',
    avatar: 'https://picsum.photos/id/1074/100/100'
  },
  {
    id: 'p004',
    name: '陈雨萱',
    gender: '女',
    age: 19,
    phone: '136****4567',
    caseNumber: 'ZZ2024004',
    treatmentStage: '第15副/共22副',
    nextVisitDate: '2024-06-23',
    avatar: 'https://picsum.photos/id/1011/100/100'
  },
  {
    id: 'p005',
    name: '刘浩然',
    gender: '男',
    age: 35,
    phone: '135****1234',
    caseNumber: 'ZZ2024005',
    treatmentStage: '第3副/共16副',
    nextVisitDate: '2024-06-24',
    avatar: 'https://picsum.photos/id/1012/100/100'
  },
  {
    id: 'p006',
    name: '赵雅琪',
    gender: '女',
    age: 27,
    phone: '134****7890',
    caseNumber: 'ZZ2024006',
    treatmentStage: '第20副/共26副',
    nextVisitDate: '2024-06-25',
    avatar: 'https://picsum.photos/id/1014/100/100'
  },
  {
    id: 'p007',
    name: '孙建国',
    gender: '男',
    age: 41,
    phone: '133****3456',
    caseNumber: 'ZZ2024007',
    treatmentStage: '第1副/共20副',
    nextVisitDate: '2024-06-26',
    avatar: 'https://picsum.photos/id/1025/100/100'
  },
  {
    id: 'p008',
    name: '周美玲',
    gender: '女',
    age: 30,
    phone: '132****9012',
    caseNumber: 'ZZ2024008',
    treatmentStage: '第10副/共24副',
    nextVisitDate: '2024-06-27',
    avatar: 'https://picsum.photos/id/1062/100/100'
  }
]

export const defaultMaterialChecks: MaterialCheckItem[] = [
  { id: 'm1', name: '附件模板（全口）', category: '附件模板', checked: false },
  { id: 'm2', name: '附件模板（前牙）', category: '附件模板', checked: false },
  { id: 'm3', name: '附件模板（后牙）', category: '附件模板', checked: false },
  { id: 'm4', name: '光固化粘接剂', category: '粘接材料', checked: false },
  { id: 'm5', name: '酸蚀剂', category: '粘接材料', checked: false },
  { id: 'm6', name: '流体树脂', category: '粘接材料', checked: false },
  { id: 'm7', name: '光固化灯', category: '辅助工具', checked: false },
  { id: 'm8', name: '吸唾管', category: '辅助工具', checked: false },
  { id: 'm9', name: '隔湿棉卷', category: '辅助工具', checked: false },
  { id: 'm10', name: '探针', category: '辅助工具', checked: false }
]

export const mockBondingTasks: BondingTask[] = [
  {
    id: 'b001',
    patientId: 'p001',
    patientName: '张小明',
    caseNumber: 'ZZ2024001',
    taskDate: '2024-06-20',
    status: 'completed',
    attachments: [
      { toothNumber: '13', type: '传统附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '14', type: '优化附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '16', type: '传统附件', direction: '咬合面', quantity: 1 },
      { toothNumber: '23', type: '传统附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '24', type: '优化附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '26', type: '传统附件', direction: '咬合面', quantity: 1 },
      { toothNumber: '33', type: '传统附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '34', type: '优化附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '43', type: '传统附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '44', type: '优化附件', direction: '颊侧', quantity: 1 }
    ],
    materialChecks: defaultMaterialChecks.map(item => ({ ...item, checked: true })),
    photos: [
      'https://picsum.photos/id/1/400/300',
      'https://picsum.photos/id/2/400/300'
    ],
    notes: '首次粘接，患者配合度良好',
    doctorName: '王医生',
    nurseName: '李护士',
    createdAt: '2024-06-20 09:00:00',
    completedAt: '2024-06-20 10:30:00'
  },
  {
    id: 'b002',
    patientId: 'p002',
    patientName: '李婷婷',
    caseNumber: 'ZZ2024002',
    taskDate: '2024-06-20',
    status: 'in_progress',
    attachments: [
      { toothNumber: '12', type: '椭圆附件', direction: '近中', quantity: 1 },
      { toothNumber: '13', type: '传统附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '22', type: '椭圆附件', direction: '远中', quantity: 1 },
      { toothNumber: '23', type: '传统附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '33', type: '传统附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '43', type: '传统附件', direction: '颊侧', quantity: 1 }
    ],
    materialChecks: defaultMaterialChecks.map((item, idx) => ({ 
      ...item, 
      checked: idx < 6,
      checkedAt: idx < 6 ? '2024-06-20 14:00:00' : undefined
    })),
    photos: [],
    notes: '',
    doctorName: '张医生',
    nurseName: '王护士',
    createdAt: '2024-06-20 13:30:00'
  },
  {
    id: 'b003',
    patientId: 'p003',
    patientName: '王大伟',
    caseNumber: 'ZZ2024003',
    taskDate: '2024-06-20',
    status: 'materials_checked',
    attachments: [
      { toothNumber: '14', type: '垂直矩形附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '15', type: '水平矩形附件', direction: '咬合面', quantity: 1 },
      { toothNumber: '24', type: '垂直矩形附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '25', type: '水平矩形附件', direction: '咬合面', quantity: 1 },
      { toothNumber: '34', type: '垂直矩形附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '35', type: '水平矩形附件', direction: '咬合面', quantity: 1 },
      { toothNumber: '44', type: '垂直矩形附件', direction: '颊侧', quantity: 1 },
      { toothNumber: '45', type: '水平矩形附件', direction: '咬合面', quantity: 1 }
    ],
    materialChecks: defaultMaterialChecks.map(item => ({ 
      ...item, 
      checked: true,
      checkedAt: '2024-06-20 15:30:00'
    })),
    photos: [],
    notes: '深覆合病例，需加强固位',
    doctorName: '李医生',
    nurseName: '张护士',
    createdAt: '2024-06-20 15:00:00'
  },
  {
    id: 'b004',
    patientId: 'p004',
    patientName: '陈雨萱',
    caseNumber: 'ZZ2024004',
    taskDate: '2024-06-21',
    status: 'pending',
    attachments: [
      { toothNumber: '11', type: '三角附件', direction: '切端', quantity: 1 },
      { toothNumber: '21', type: '三角附件', direction: '切端', quantity: 1 }
    ],
    materialChecks: [...defaultMaterialChecks],
    photos: [],
    notes: '前牙压低附件',
    doctorName: '王医生',
    createdAt: '2024-06-19 16:00:00'
  }
]

export const mockFollowUpRecords: FollowUpRecord[] = [
  {
    id: 'f001',
    patientId: 'p001',
    patientName: '张小明',
    caseNumber: 'ZZ2024001',
    visitDate: '2024-06-15',
    teeth: [
      { toothNumber: '13', status: 'intact', previousType: '传统附件' },
      { toothNumber: '14', status: 'intact', previousType: '优化附件' },
      { toothNumber: '16', status: 'worn', previousType: '传统附件', notes: '咬合面磨耗约1/3' },
      { toothNumber: '23', status: 'intact', previousType: '传统附件' },
      { toothNumber: '24', status: 'fallen', previousType: '优化附件', notes: '已脱落，需重粘' },
      { toothNumber: '26', status: 'intact', previousType: '传统附件' },
      { toothNumber: '33', status: 'intact', previousType: '传统附件' },
      { toothNumber: '34', status: 'worn', previousType: '优化附件', notes: '边缘少许磨损' },
      { toothNumber: '43', status: 'intact', previousType: '传统附件' },
      { toothNumber: '44', status: 'intact', previousType: '优化附件' }
    ],
    doctorOpinion: '整体情况良好，24号牙附件脱落需重粘，16号牙附件磨耗需关注。建议患者注意饮食，避免硬物。',
    nextVisitDate: '2024-06-29',
    doctorName: '王医生',
    createdAt: '2024-06-15 10:30:00'
  },
  {
    id: 'f002',
    patientId: 'p002',
    patientName: '李婷婷',
    caseNumber: 'ZZ2024002',
    visitDate: '2024-06-10',
    teeth: [
      { toothNumber: '12', status: 'intact', previousType: '椭圆附件' },
      { toothNumber: '13', status: 'intact', previousType: '传统附件' },
      { toothNumber: '22', status: 'intact', previousType: '椭圆附件' },
      { toothNumber: '23', status: 'intact', previousType: '传统附件' },
      { toothNumber: '33', status: 'intact', previousType: '传统附件' },
      { toothNumber: '43', status: 'intact', previousType: '传统附件' }
    ],
    doctorOpinion: '全部附件完好，继续当前矫治方案。',
    nextVisitDate: '2024-06-24',
    doctorName: '张医生',
    createdAt: '2024-06-10 14:00:00'
  },
  {
    id: 'f003',
    patientId: 'p003',
    patientName: '王大伟',
    caseNumber: 'ZZ2024003',
    visitDate: '2024-06-08',
    teeth: [
      { toothNumber: '14', status: 'fallen', previousType: '垂直矩形附件', notes: '脱落' },
      { toothNumber: '15', status: 'intact', previousType: '水平矩形附件' },
      { toothNumber: '24', status: 'worn', previousType: '垂直矩形附件' },
      { toothNumber: '25', status: 'intact', previousType: '水平矩形附件' },
      { toothNumber: '34', status: 'intact', previousType: '垂直矩形附件' },
      { toothNumber: '35', status: 'intact', previousType: '水平矩形附件' },
      { toothNumber: '44', status: 'fallen', previousType: '垂直矩形附件', notes: '脱落' },
      { toothNumber: '45', status: 'intact', previousType: '水平矩形附件' }
    ],
    doctorOpinion: '双侧下颌第一前磨牙附件脱落，需重粘。患者咬合力较大，建议使用加强型附件。',
    nextVisitDate: '2024-06-22',
    doctorName: '李医生',
    createdAt: '2024-06-08 09:30:00'
  }
]

export const defaultPrecautions = [
  '粘接后2小时内请勿进食',
  '避免食用过硬、过黏的食物',
  '保持口腔卫生，饭后及时刷牙',
  '如感觉附件尖锐或不适，请及时联系医生',
  '按时佩戴矫治器，每天不少于22小时'
]

export const defaultDiscomforts = [
  '初期可能有轻微异物感，通常3-5天适应',
  '牙齿可能有轻微酸胀感，属于正常现象',
  '附件边缘可能摩擦黏膜，必要时使用正畸蜡'
]
