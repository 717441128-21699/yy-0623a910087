import React, { useState, useMemo } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import PatientCard from '@/components/PatientCard'
import type { Patient } from '@/types'
import { mockPatients, mockBondingTasks, mockFollowUpRecords } from '@/data/mock'

const PatientListPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [searchText, setSearchText] = useState('')
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const filteredPatients = useMemo(() => {
    if (!searchText.trim()) return patients
    const keyword = searchText.trim().toLowerCase()
    return patients.filter(p => 
      p.name.toLowerCase().includes(keyword) || 
      p.caseNumber.toLowerCase().includes(keyword)
    )
  }, [patients, searchText])

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayBonding = mockBondingTasks.filter(t => t.taskDate === today).length
    const todayFollowUp = mockFollowUpRecords.filter(r => r.visitDate === today).length
    return {
      total: patients.length,
      todayBonding,
      todayFollowUp
    }
  }, [patients.length])

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowActionSheet(true)
  }

  const handleCreateBonding = () => {
    if (!selectedPatient) return
    setShowActionSheet(false)
    Taro.setStorageSync('currentPatient', selectedPatient)
    Taro.switchTab({ url: '/pages/bonding/index' })
  }

  const handleCreateFollowUp = () => {
    if (!selectedPatient) return
    setShowActionSheet(false)
    Taro.setStorageSync('currentPatient', selectedPatient)
    Taro.switchTab({ url: '/pages/follow-up/index' })
  }

  const handleCloseActionSheet = () => {
    setShowActionSheet(false)
    setSelectedPatient(null)
  }

  return (
    <ScrollView className={styles.page} scrollY enablePullDownRefresh>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>患者管理</Text>
        <Text className={styles.headerSubtitle}>正畸粘接记录 · 专业高效</Text>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索患者姓名或病历号"
            placeholderClass="inputPlaceholder"
            value={searchText}
            onInput={e => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statsCard}>
          <Text className={styles.statsNum}>{stats.total}</Text>
          <Text className={styles.statsLabel}>患者总数</Text>
        </View>
        <View className={styles.statsCard}>
          <Text className={styles.statsNum}>{stats.todayBonding}</Text>
          <Text className={styles.statsLabel}>今日粘接</Text>
        </View>
        <View className={styles.statsCard}>
          <Text className={styles.statsNum}>{stats.todayFollowUp}</Text>
          <Text className={styles.statsLabel}>今日复诊</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>患者列表</Text>
          <Text className={styles.sectionCount}>共 {filteredPatients.length} 人</Text>
        </View>

        <View className={styles.patientList}>
          {filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => handlePatientClick(patient)}
              />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>
                {searchText ? '未找到匹配的患者' : '暂无患者数据'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {showActionSheet && selectedPatient && (
        <View onClick={handleCloseActionSheet} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }}>
          <View className={styles.actionSheet} onClick={e => e.stopPropagation()} style={{ width: '100%' }}>
            <View className={styles.actionSheetHeader}>
              <Text className={styles.actionSheetTitle}>选择操作</Text>
              <Text className={styles.actionSheetPatient}>
                {selectedPatient.name} · {selectedPatient.caseNumber}
              </Text>
            </View>
            <View className={styles.actionSheetBody}>
              <View 
                className={`${styles.actionButton} ${styles.primaryBtn}`}
                onClick={handleCreateBonding}
              >
                新建粘接任务
              </View>
              <View 
                className={`${styles.actionButton} ${styles.secondaryBtn}`}
                onClick={handleCreateFollowUp}
              >
                新建复诊记录
              </View>
              <View 
                className={`${styles.actionButton} ${styles.cancelBtn}`}
                onClick={handleCloseActionSheet}
              >
                取消
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default PatientListPage
