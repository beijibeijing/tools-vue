<template>
  <div class="thank-dialog-container">
    <el-dialog
      title="感谢"
      :model-value="modelValue"
      width="500px"
      :before-close="closeDialog"
    >
      <div class="thank-main">
        <p>😃以下为赞助列表，感谢大家的支持！😄（按时间排序）</p>
        <div class="thank-list">
          <el-scrollbar>
            <p v-for="item in thankList" class="thank-item">
              <span>{{ item.name }}（￥{{ item.money?.toFixed(2) }}）</span>
              <span>{{ item.time }}</span>
            </p>
          </el-scrollbar>
        </div>
      </div>
      <template #footer>
        <span class="sum-money">￥{{ sumMoney }}</span>
        <el-button plain size="medium" @click="closeDialog">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import thankList from '@/assets/json/thank-list.json';

  export default {
    name: 'ThankDialog',
    props: ['modelValue'],
    data() {
      return {
        thankList: thankList,
      };
    },
    methods: {
      closeDialog() {
        this.$emit('update:modelValue', false);
      },
    },
    computed: {
      sumMoney() {
        return this.thankList.reduce((acc, current) => acc + current.money, 0).toFixed(2);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .thank-dialog-container {
    .thank-main {
      margin: -10px 0;

      p {
        line-height: 1.7;
        margin: 10px 0;
      }

      .thank-list {
        ::v-deep(.el-scrollbar) {
          .el-scrollbar__wrap {
            max-height: 300px;
          }
        }

        .thank-item {
          display: flex;
          justify-content: space-between;
        }
      }
    }

    .sum-money {
      color: transparent;
      margin-right: 10px;
    }
  }
</style>
