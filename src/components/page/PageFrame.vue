<template>
  <div class="page-frame-container">
    <div class="frame-header">
      <div v-if="$slots.title || title" class="frame-title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="$slots.description || description" class="frame-description">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>

    <div class="frame-main">
      <slot />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'PageFrame',
    props: ['title', 'description'],
  };
</script>

<style lang="scss" scoped>
  .page-frame-container {
    .frame-header {
      padding: 10px 10px;
      font-size: 20px;
      font-weight: bold;
      border-bottom: 1px solid $border-color;

      .frame-title {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
      }

      .frame-description {
        margin-top: 20px;
        font-size: 12px;
        font-weight: normal;
        color: $info-color;
      }
    }

    .frame-main {
      padding: 20px;

      ::v-deep(.el-form) {
        .el-form-item {
          .tip {
            margin-left: 10px;
            color: $normal-color;
          }

          & > .el-input, .el-cascader, .el-select, .el-date-editor, .el-autocomplete {
            width: 100%;
          }

          .el-color-picker, .el-input, .el-cascader, .el-select, .el-button, .el-radio-group, .el-checkbox-group, .el-input-number {
            vertical-align: top;
          }
        }
      }
    }
  }
</style>
