import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import ToothChart from '@/components/ToothChart'
import { BondingStatusTag } from '@/components/StatusTag'
import classnames from 'classnames'
import { 
  mockPatients, 
  mockBondingTasks, 
  defaultMaterialChecks,
  defaultPrecautions,
  defaultDiscomforts
} from '@/data/mock'
import { generateId, formatDate, formatTime } from '@/utils'
import type { 
  Patient, BondingTask, ToothAttachment, MaterialCheckItem,
  AttachmentType, AttachmentDirection
} from '@/types'

type TabType = 'list' | 'create'

const ATTACHMENT_TYPES: AttachmentType[] = [
  '传统附件', '优化附件', '水平矩形附件', 
  '垂直矩形附件', '椭圆附件', '三角附件'
]

const ATTACHMENT_DIRECTIONS: AttachmentDirection[] = [
  '近中', '远中', '颊侧', '舌侧', '咬合面'
]

const BondingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [tasks, setTasks] = useState<BondingTask[]>(mockBondingTasks)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [completedTask, setCompletedTask] = useState<BondingTask | null>(null)
  const [patientSearch, setPatientSearch] = useState('')

  // 表单状态
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [attachments, setAttachments] = useState<ToothAttachment[]>([])
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([])
  const [editingTooth, setEditingTooth] = useState<string | null>(null)
  const [editType, setEditType] = useState<AttachmentType>('传统附件')
  const [editDirection, setEditDirection] = useState<AttachmentDirection>('颊侧')
  const [editQuantity, setEditQuantity] = useState(1)
  const [editNotes, setEditNotes] = useState('')
  const [materialChecks, setMaterialChecks] = useState<MaterialCheckItem[]>(
    defaultMaterialChecks.map(m => ({ ...m }))
  )
  const [photos, setPhotos] = useState<string[]>([])
  const [taskNotes, setTaskNotes] = useState('')

  useEffect(() => {
    const patient: Patient | null = Taro.getStorageSync('currentPatient')
    if (patient) {
      setSelectedPatient(patient)
      setActiveTab('create')
      Taro.removeStorageSync('currentPatient')
    }
  }, [])

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return mockPatients
    const kw = patientSearch.trim().toLowerCase()
    return mockPatients.filter(p => 
      p.name.toLowerCase().includes(kw) || p.caseNumber.toLowerCase().includes(kw)
    )
  }, [patientSearch])

  const toothCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    attachments.forEach(a => { map[a.toothNumber] = a.quantity })
    return map
  }, [attachments])

  const attachmentMap = useMemo(() => {
    const map: Record<string, ToothAttachment> = {}
    attachments.forEach(a => { map[a.toothNumber] = a })
    return map
  }, [attachments])

  const materialsCheckedCount = materialChecks.filter(m => m.checked).length

  const handleToothClick = (toothNumber: string) => {
    if (attachmentMap[toothNumber]) {
      const att = attachmentMap[toothNumber]
      setEditingTooth(toothNumber)
      setEditType(att.type)
      setEditDirection(att.direction)
      setEditQuantity(att.quantity)
      setEditNotes(att.notes || '')
      setShowEditModal(true)
    } else {
      setSelectedTeeth(prev => 
        prev.includes(toothNumber) 
          ? prev.filter(t => t !== toothNumber)
          : [...prev, toothNumber]
      )
      setEditingTooth(toothNumber)
      setEditType('传统附件')
      setEditDirection('颊侧')
      setEditQuantity(1)
      setEditNotes('')
      setShowEditModal(true)
    }
  }

  const handleSaveEdit = () => {
    if (!editingTooth) return

    setAttachments(prev => {
      const existing = prev.findIndex(a => a.toothNumber === editingTooth)
      const newAtt: ToothAttachment = {
        toothNumber: editingTooth,
        type: editType,
        direction: editDirection,
        quantity: editQuantity,
        notes: editNotes || undefined
      }
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = newAtt
        return updated
      }
      return [...prev, newAtt]
    })

    setSelectedTeeth(prev => 
      prev.includes(editingTooth) ? prev : [...prev, editingTooth]
    )
    setShowEditModal(false)
    setEditingTooth(null)
  }

  const handleDeleteAttachment = (toothNumber: string) => {
    setAttachments(prev => prev.filter(a => a.toothNumber !== toothNumber))
    setSelectedTeeth(prev => prev.filter(t => t !== toothNumber))
  }

  const handleToggleMaterial = (id: string) => {
    setMaterialChecks(prev => prev.map(m => 
      m.id === id ? { 
        ...m, 
        checked: !m.checked,
        checkedAt: !m.checked ? new Date().toLocaleString() : undefined,
        checkedBy: !m.checked ? '李护士' : undefined
      } : m
    ))
  }

  const handleCheckAllMaterials = () => {
    const allChecked = materialsCheckedCount === materialChecks.length
    setMaterialChecks(prev => prev.map(m => ({
      ...m,
      checked: !allChecked,
      checkedAt: !allChecked ? new Date().toLocaleString() : undefined,
      checkedBy: !allChecked ? '李护士' : undefined
    })))
  }

  const handleAddPhoto = () => {
    const mockPhotos = [
      'https://picsum.photos/id/1/400/300',
      'https://picsum.photos/id/2/400/300',
      'https://picsum.photos/id/3/400/300',
      'https://picsum.photos/id/4/400/300',
      'https://picsum.photos/id/5/400/300'
    ]
    if (photos.length < 9) {
      const idx = photos.length % mockPhotos.length
      setPhotos(prev => [...prev, mockPhotos[idx]])
      Taro.showToast({ title: '拍照成功', icon: 'success' })
    }
  }

  const handleDeletePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setSelectedPatient(null)
    setAttachments([])
    setSelectedTeeth([])
    setMaterialChecks(defaultMaterialChecks.map(m => ({ ...m })))
    setPhotos([])
    setTaskNotes('')
  }

  const handleSaveTask = (status: BondingTask['status']) => {
    if (!selectedPatient) {
      Taro.showToast({ title: '请先选择患者', icon: 'none' })
      return
    }
    if (attachments.length === 0) {
      Taro.showToast({ title: '请至少添加一颗牙的附件', icon: 'none' })
      return
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const task: BondingTask = {
      id: generateId(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      caseNumber: selectedPatient.caseNumber,
      taskDate: today,
      status,
      attachments: [...attachments],
      materialChecks: [...materialChecks],
      photos: [...photos],
      notes: taskNotes || undefined,
      doctorName: '王医生',
      nurseName: materialsCheckedCount > 0 ? '李护士' : undefined,
      createdAt: now.toLocaleString(),
      completedAt: status === 'completed' ? now.toLocaleString() : undefined
    }

    setTasks(prev => [task, ...prev])
    
    if (status === 'completed') {
      setCompletedTask(task)
      setShowCardModal(true)
    } else {
      Taro.showToast({ title: '保存成功', icon: 'success' })
    }
    
    resetForm()
    setActiveTab('list')
  }

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowPatientModal(false)
    setPatientSearch('')
  }

  const handleTaskClick = (task: BondingTask) => {
    Taro.navigateTo({ 
      url: `/pages/bonding-detail/index?id=${task.id}` 
    })
  }

  const getTaskProgress = (task: BondingTask) => {
    let progress = 0
    if (task.attachments.length > 0) progress += 40
    const checkedCount = task.materialChecks.filter(m => m.checked).length
    if (task.materialChecks.length > 0) {
      progress += Math.floor((checkedCount / task.materialChecks.length) * 30)
    }
    if (task.photos.length > 0) progress += 15
    if (task.status === 'completed') progress = 100
    return Math.min(progress, 100)
  }

  const groupedMaterials = useMemo(() => {
    return {
      template: materialChecks.filter(m => m.category === '附件模板'),
      material: materialChecks.filter(m => m.category === '粘接材料'),
      tool: materialChecks.filter(m => m.category === '辅助工具')
    }
  }, [materialChecks])

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        <View 
          className={classnames(styles.tabItem, activeTab === 'list' && styles.tabActive)}
          onClick={() => setActiveTab('list')}
        >
          任务列表
        </View>
        <View 
          className={classnames(styles.tabItem, activeTab === 'create' && styles.tabActive)}
          onClick={() => setActiveTab('create')}
        >
          新建任务
        </View>
      </View>

      {activeTab === 'list' ? (
        <ScrollView scrollY className={styles.content}>
          {tasks.length > 0 ? tasks.map(task => (
            <View key={task.id} className={styles.taskCard} onClick={() => handleTaskClick(task)}>
              <View className={styles.taskHeader}>
                <View>
                  <Text className={styles.taskPatient}>{task.patientName}</Text>
                  <Text className={styles.taskCase}>{task.caseNumber}</Text>
                </View>
                <BondingStatusTag status={task.status} />
              </View>
              
              <View className={styles.taskMeta}>
                <View className={styles.taskMetaItem}>
                  <Text>📅</Text>
                  <Text>{task.taskDate} {formatTime(task.createdAt)}</Text>
                </View>
                <View className={styles.taskMetaItem}>
                  <Text>🦷</Text>
                  <Text>{task.attachments.length}颗牙</Text>
                </View>
                <View className={styles.taskMetaItem}>
                  <Text>✅</Text>
                  <Text>{task.materialChecks.filter(m => m.checked).length}/{task.materialChecks.length}材料</Text>
                </View>
              </View>

              {task.attachments.length > 0 && (
                <View className={styles.taskAttachments}>
                  {task.attachments.slice(0, 6).map(att => (
                    <Text key={att.toothNumber} className={styles.taskAttachTag}>
                      {att.toothNumber}·{att.type}
                    </Text>
                  ))}
                  {task.attachments.length > 6 && (
                    <Text className={styles.taskAttachTag}>+{task.attachments.length - 6}</Text>
                  )}
                </View>
              )}

              <View className={styles.taskProgress}>
                <View 
                  className={styles.taskProgressBar} 
                  style={{ width: `${getTaskProgress(task)}%` }}
                />
              </View>
              <View className={styles.taskProgressText}>
                <Text>完成进度</Text>
                <Text>{getTaskProgress(task)}%</Text>
              </View>
            </View>
          )) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📝</Text>
              <Text className={styles.emptyText}>暂无粘接任务</Text>
              <View className={styles.emptyBtn} onClick={() => setActiveTab('create')}>
                新建任务
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView scrollY className={styles.content}>
          <View className={styles.formCard}>
            <View className={styles.formTitle}>
              <View className={styles.formTitleIcon}></View>
              <Text>1. 选择患者</Text>
            </View>
            <View 
              className={styles.selectPatient}
              onClick={() => setShowPatientModal(true)}
            >
              {selectedPatient ? (
                <View className={styles.selectPatientInfo}>
                  <Text className={styles.selectPatientName}>
                    {selectedPatient.name} · {selectedPatient.gender} {selectedPatient.age}岁
                  </Text>
                  <Text className={styles.selectPatientMeta}>
                    {selectedPatient.caseNumber} | {selectedPatient.treatmentStage}
                  </Text>
                </View>
              ) : (
                <View className={styles.selectPatientInfo}>
                  <Text className={styles.selectPatientName} style={{ color: '#86909c' }}>
                    点击选择患者
                  </Text>
                  <Text className={styles.selectPatientMeta}>
                    从患者列表中选择本次粘接的患者
                  </Text>
                </View>
              )}
              <Text className={styles.selectArrow}>›</Text>
            </View>
          </View>

          <View className={styles.formCard}>
            <View className={styles.formTitle}>
              <View className={styles.formTitleIcon}></View>
              <Text>2. 标注附件（点击牙位填写）</Text>
            </View>
            <ToothChart
              selectedTeeth={selectedTeeth}
              toothCountMap={toothCountMap}
              mode="select"
              onToothClick={handleToothClick}
              showLegend={false}
            />

            {attachments.length > 0 && (
              <View className={styles.attachmentList}>
                {attachments.map(att => (
                  <View key={att.toothNumber} className={styles.attachmentItem}>
                    <View className={styles.attachmentTooth}>{att.toothNumber}</View>
                    <View className={styles.attachmentInfo}>
                      <Text className={styles.attachmentType}>{att.type}</Text>
                      <Text className={styles.attachmentMeta}>
                        {att.direction} · {att.quantity}个
                        {att.notes ? ` · ${att.notes}` : ''}
                      </Text>
                    </View>
                    <View 
                      className={styles.attachmentDelete}
                      onClick={() => handleDeleteAttachment(att.toothNumber)}
                    >
                      ×
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className={styles.formCard}>
            <View className={styles.formTitle}>
              <View className={styles.formTitleIcon}></View>
              <Text>3. 材料与模板核对（护士）</Text>
            </View>
            
            <View className={styles.materialCheckAll} onClick={handleCheckAllMaterials}>
              {materialsCheckedCount === materialChecks.length ? '取消全选' : '一键全选'}
            </View>

            <View className={styles.materialSection}>
              <Text className={styles.materialSectionTitle}>附件模板</Text>
              {groupedMaterials.template.map(item => (
                <View 
                  key={item.id}
                  className={classnames(styles.materialItem, item.checked && styles.materialItemChecked)}
                  onClick={() => handleToggleMaterial(item.id)}
                >
                  <View className={classnames(
                    styles.materialCheckbox,
                    item.checked && styles.materialCheckboxChecked
                  )}>
                    {item.checked && <Text>✓</Text>}
                  </View>
                  <Text className={styles.materialName}>{item.name}</Text>
                  {item.checkedBy && (
                    <Text className={styles.materialCheckedBy}>{item.checkedBy}</Text>
                  )}
                </View>
              ))}
            </View>

            <View className={styles.materialSection}>
              <Text className={styles.materialSectionTitle}>粘接材料</Text>
              {groupedMaterials.material.map(item => (
                <View 
                  key={item.id}
                  className={classnames(styles.materialItem, item.checked && styles.materialItemChecked)}
                  onClick={() => handleToggleMaterial(item.id)}
                >
                  <View className={classnames(
                    styles.materialCheckbox,
                    item.checked && styles.materialCheckboxChecked
                  )}>
                    {item.checked && <Text>✓</Text>}
                  </View>
                  <Text className={styles.materialName}>{item.name}</Text>
                  {item.checkedBy && (
                    <Text className={styles.materialCheckedBy}>{item.checkedBy}</Text>
                  )}
                </View>
              ))}
            </View>

            <View className={styles.materialSection}>
              <Text className={styles.materialSectionTitle}>辅助工具</Text>
              {groupedMaterials.tool.map(item => (
                <View 
                  key={item.id}
                  className={classnames(styles.materialItem, item.checked && styles.materialItemChecked)}
                  onClick={() => handleToggleMaterial(item.id)}
                >
                  <View className={classnames(
                    styles.materialCheckbox,
                    item.checked && styles.materialCheckboxChecked
                  )}>
                    {item.checked && <Text>✓</Text>}
                  </View>
                  <Text className={styles.materialName}>{item.name}</Text>
                  {item.checkedBy && (
                    <Text className={styles.materialCheckedBy}>{item.checkedBy}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formCard}>
            <View className={styles.formTitle}>
              <View className={styles.formTitleIcon}></View>
              <Text>4. 拍照确认</Text>
            </View>
            <View className={styles.photoSection}>
              <View className={styles.photoGrid}>
                {photos.map((photo, idx) => (
                  <View key={idx} className={styles.photoItem}>
                    <Image className={styles.photoImg} src={photo} mode="aspectFill" />
                    <View 
                      className={styles.photoDelete}
                      onClick={() => handleDeletePhoto(idx)}
                    >
                      ×
                    </View>
                  </View>
                ))}
                {photos.length < 9 && (
                  <View className={styles.photoAdd} onClick={handleAddPhoto}>
                    <Text className={styles.photoAddIcon}>📷</Text>
                    <Text className={styles.photoAddText}>拍照/上传</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className={styles.formCard}>
            <View className={styles.formTitle}>
              <View className={styles.formTitleIcon}></View>
              <Text>5. 备注（可选）</Text>
            </View>
            <Input
              className={styles.notesInput}
              placeholder="输入备注信息，如特殊情况、患者配合度等"
              value={taskNotes}
              onInput={e => setTaskNotes(e.detail.value)}
            />
          </View>
        </ScrollView>
      )}

      {activeTab === 'create' && (
        <View className={styles.bottomBar}>
          <View 
            className={classnames(styles.bottomBtn, styles.btnDefault)}
            onClick={resetForm}
          >
            重置
          </View>
          <View 
            className={classnames(styles.bottomBtn, styles.btnSecondary)}
            onClick={() => handleSaveTask('materials_checked')}
          >
            暂存
          </View>
          <View 
            className={classnames(
              styles.bottomBtn, styles.btnPrimary,
              (!selectedPatient || attachments.length === 0) && styles.btnDisabled
            )}
            onClick={() => handleSaveTask('completed')}
          >
            完成粘接
          </View>
        </View>
      )}

      {/* 患者选择弹窗 */}
      {showPatientModal && (
        <View className={styles.modalMask} onClick={() => setShowPatientModal(false)}>
          <View className={styles.modal} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择患者</Text>
              <Text className={styles.modalClose} onClick={() => setShowPatientModal(false)}>×</Text>
            </View>
            <View className={styles.modalSearch}>
              <Input
                className={styles.modalSearchInput}
                placeholder="搜索姓名或病历号"
                value={patientSearch}
                onInput={e => setPatientSearch(e.detail.value)}
              />
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              {filteredPatients.map(patient => (
                <View 
                  key={patient.id}
                  className={styles.patientOption}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <View>
                    <Text className={styles.patientOptionName}>
                      {patient.name} · {patient.gender} {patient.age}岁
                    </Text>
                    <Text className={styles.patientOptionMeta}>
                      {patient.caseNumber} | {patient.treatmentStage}
                    </Text>
                  </View>
                  {selectedPatient?.id === patient.id && (
                    <Text className={styles.patientOptionSelected}>✓</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* 附件编辑弹窗 */}
      {showEditModal && editingTooth && (
        <View className={styles.editModalMask} onClick={() => setShowEditModal(false)}>
          <View className={styles.editModal} onClick={e => e.stopPropagation()}>
            <View className={styles.editModalHeader}>
              <Text className={styles.modalTitle}>设置附件信息</Text>
              <Text className={styles.modalClose} onClick={() => setShowEditModal(false)}>×</Text>
            </View>
            <View className={styles.editModalBody}>
              <Text className={styles.editToothTitle}>{editingTooth}号牙</Text>

              <View className={styles.formRow}>
                <Text className={styles.formLabel}>附件类型</Text>
                <View className={styles.typeSelector}>
                  {ATTACHMENT_TYPES.map(type => (
                    <View
                      key={type}
                      className={classnames(
                        styles.typeOption,
                        editType === type && styles.typeOptionActive
                      )}
                      onClick={() => setEditType(type)}
                    >
                      {type}
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.sectionDivider} />

              <View className={styles.formRow}>
                <Text className={styles.formLabel}>附件方向</Text>
                <View className={styles.typeSelector}>
                  {ATTACHMENT_DIRECTIONS.map(dir => (
                    <View
                      key={dir}
                      className={classnames(
                        styles.typeOption,
                        editDirection === dir && styles.typeOptionActive
                      )}
                      onClick={() => setEditDirection(dir)}
                    >
                      {dir}
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.sectionDivider} />

              <View className={styles.formRow}>
                <Text className={styles.formLabel}>附件数量</Text>
                <View className={styles.quantityRow}>
                  <View 
                    className={styles.quantityBtn}
                    onClick={() => setEditQuantity(q => Math.max(1, q - 1))}
                  >
                    −
                  </View>
                  <Text className={styles.quantityValue}>{editQuantity}</Text>
                  <View 
                    className={styles.quantityBtn}
                    onClick={() => setEditQuantity(q => Math.min(4, q + 1))}
                  >
                    +
                  </View>
                </View>
              </View>

              <View className={styles.sectionDivider} />

              <View className={styles.formRow}>
                <Text className={styles.formLabel}>备注（可选）</Text>
                <Input
                  className={styles.notesInput}
                  placeholder="如：加强固位、调整位置等"
                  value={editNotes}
                  onInput={e => setEditNotes(e.detail.value)}
                />
              </View>

              <View className={styles.bottomBar} style={{ position: 'relative', marginTop: 32, padding: 0, boxShadow: 'none' }}>
                <View 
                  className={classnames(styles.bottomBtn, styles.btnDefault)}
                  onClick={() => setShowEditModal(false)}
                >
                  取消
                </View>
                <View 
                  className={classnames(styles.bottomBtn, styles.btnPrimary)}
                  onClick={handleSaveEdit}
                >
                  确认
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 患者沟通卡弹窗 */}
      {showCardModal && completedTask && (
        <View className={styles.modalMask} onClick={() => setShowCardModal(false)}>
          <View className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>患者沟通卡</Text>
              <Text className={styles.modalClose} onClick={() => setShowCardModal(false)}>×</Text>
            </View>
            <ScrollView scrollY style={{ flex: 1, padding: '0 32rpx 32rpx' }}>
              <View className={styles.communicationCard}>
                <View className={styles.cardHeader}>
                  <Text className={styles.cardHeaderTitle}>粘接完成确认单</Text>
                  <Text className={styles.cardHeaderSub}>
                    {completedTask.patientName} · {completedTask.taskDate}
                  </Text>
                </View>

                <View className={styles.cardSection}>
                  <Text className={styles.cardSectionTitle}>
                    <Text className={styles.cardSectionTitleIcon}>🦷</Text>
                    本次粘接附件（{completedTask.attachments.length}颗牙）
                  </Text>
                  {completedTask.attachments.map(att => (
                    <View key={att.toothNumber} className={styles.attachSummaryItem}>
                      <View className={styles.attachSummaryTooth}>{att.toothNumber}</View>
                      <View className={styles.attachSummaryInfo}>
                        <Text className={styles.attachSummaryType}>{att.type}</Text>
                        <Text className={styles.attachSummaryMeta}>
                          {att.direction}方向 · 共{att.quantity}个
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View className={styles.cardSection}>
                  <Text className={styles.cardSectionTitle}>
                    <Text className={styles.cardSectionTitleIcon}>📌</Text>
                    注意事项
                  </Text>
                  <View className={styles.cardList}>
                    {defaultPrecautions.map((item, idx) => (
                      <Text key={idx} className={styles.cardListItem}>{item}</Text>
                    ))}
                  </View>
                </View>

                <View className={styles.cardSection}>
                  <Text className={styles.cardSectionTitle}>
                    <Text className={styles.cardSectionTitleIcon}>💡</Text>
                    可能出现的感觉
                  </Text>
                  <View className={styles.cardList}>
                    {defaultDiscomforts.map((item, idx) => (
                      <Text key={idx} className={styles.cardListItem}>{item}</Text>
                    ))}
                  </View>
                </View>

                <View className={styles.cardFooter}>
                  <View>
                    <Text className={styles.cardFooterText}>下次复查时间</Text>
                    <Text className={styles.cardFooterDate}>
                      {mockPatients.find(p => p.id === completedTask.patientId)?.nextVisitDate || '遵医嘱'}
                    </Text>
                  </View>
                  <View style={{ textAlign: 'right' }}>
                    <Text className={styles.cardFooterText}>医生签字</Text>
                    <Text className={styles.cardFooterDate}>{completedTask.doctorName}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  )
}

export default BondingPage
