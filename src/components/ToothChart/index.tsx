import React, { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import classnames from 'classnames'
import { permanentTeeth } from '@/utils'
import type { ToothStatus } from '@/types'

export interface ToothChartProps {
  title?: string
  subtitle?: string
  selectedTeeth?: string[]
  toothStatusMap?: Record<string, ToothStatus>
  toothCountMap?: Record<string, number>
  mode?: 'select' | 'status'
  showLegend?: boolean
  onToothClick?: (toothNumber: string) => void
}

const ToothChart: React.FC<ToothChartProps> = ({
  title,
  subtitle,
  selectedTeeth = [],
  toothStatusMap = {},
  toothCountMap = {},
  mode = 'select',
  showLegend = true,
  onToothClick
}) => {
  const selectedCount = useMemo(() => {
    if (mode === 'select') {
      return selectedTeeth.length
    }
    return Object.keys(toothStatusMap).length
  }, [selectedTeeth, toothStatusMap, mode])

  const getToothClass = (toothNumber: string) => {
    if (mode === 'select') {
      return classnames(styles.toothItem, {
        [styles.toothSelected]: selectedTeeth.includes(toothNumber)
      })
    }
    const status = toothStatusMap[toothNumber]
    return classnames(styles.toothItem, {
      [styles.toothStatusIntact]: status === 'intact',
      [styles.toothStatusWorn]: status === 'worn',
      [styles.toothStatusFallen]: status === 'fallen',
      [styles.toothStatusRebond]: status === 'rebond'
    })
  }

  const handleToothClick = (toothNumber: string) => {
    if (onToothClick) {
      onToothClick(toothNumber)
    }
  }

  const renderTooth = (tooth: string) => (
    <View
      key={tooth}
      className={getToothClass(tooth)}
      onClick={() => handleToothClick(tooth)}
    >
      {tooth.slice(1)}
      {toothCountMap[tooth] > 0 && (
        <View className={styles.toothBadge}>
          {toothCountMap[tooth]}
        </View>
      )}
    </View>
  )

  return (
    <View className={styles.container}>
      {title && <Text className={styles.title}>{title}</Text>}
      {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      
      <View className={styles.chartWrapper}>
        <View className={styles.arch}>
          <Text className={styles.archLabel}>上颌</Text>
          <View className={styles.toothRow}>
            {permanentTeeth.upperRight.slice().reverse().map(renderTooth)}
            <View className={styles.midline}></View>
            {permanentTeeth.upperLeft.map(renderTooth)}
          </View>
        </View>

        <View className={styles.arch}>
          <View className={styles.toothRow}>
            {permanentTeeth.lowerLeft.map(renderTooth)}
            <View className={styles.midline}></View>
            {permanentTeeth.lowerRight.slice().reverse().map(renderTooth)}
          </View>
          <Text className={styles.archLabel}>下颌</Text>
        </View>
      </View>

      {showLegend && mode === 'status' && (
        <View className={styles.legend}>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.toothStatusIntact)}></View>
            <Text>完好</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.toothStatusWorn)}></View>
            <Text>磨耗</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.toothStatusFallen)}></View>
            <Text>脱落</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.toothStatusRebond)}></View>
            <Text>需重粘</Text>
          </View>
        </View>
      )}

      {mode === 'select' && selectedCount > 0 && (
        <View className={styles.selectedInfo}>
          <Text className={styles.selectedInfoText}>
            已选择 <Text style={{ color: '#1677ff', fontWeight: 500 }}>{selectedCount}</Text> 颗牙
          </Text>
        </View>
      )}
    </View>
  )
}

export default ToothChart
