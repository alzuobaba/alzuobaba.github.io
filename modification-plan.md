# 布局修改详细方案

## 需求理解
1. **右侧布局**：从两列独立布局改为2列多行的网格布局，每个组占用一个网格单元
2. **左侧菜单**：保持2列网格布局，但确保组名顺序与右侧一致

## 修改文件

### 1. CSS修改（alzuobaba.github.io/css/styles.css）

#### 修改 `.categories-wrapper`
```css
.categories-wrapper {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xl);
    align-items: stretch;
}
```

#### 移除 `.group-column` 相关样式
```css
/* 删除以下样式 */
.group-column {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
}
```

#### 调整 `.category` 样式
```css
.category {
    background-color: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s ease;
    /* 移除 flex: 1; */
}
```

### 2. JavaScript修改（alzuobaba.github.io/js/app.js）

#### 修改 `renderTwoGroups()` 方法
```javascript
renderTwoGroups() {
    if (!this.data || !this.data.categories) {
        this.showError('暂无数据');
        return;
    }
    
    this.categoriesContainer.innerHTML = '';
    
    // 创建网格容器
    const wrapper = document.createElement('div');
    wrapper.className = 'categories-wrapper';
    
    // 直接渲染所有分类，不再分组
    this.data.categories.forEach((category, index) => {
        const categoryElement = this.createCategoryElement(category);
        categoryElement.id = `category-${index}`;
        wrapper.appendChild(categoryElement);
    });
    
    this.categoriesContainer.appendChild(wrapper);
}
```

#### 保持 `renderGroupNavigation()` 不变
左侧菜单已经是2列布局，只需确保顺序与右侧一致。

### 3. 响应式布局调整

#### 修改媒体查询
```css
@media (max-width: 1200px) {
    .categories-wrapper {
        grid-template-columns: 1fr; /* 单列布局 */
        gap: var(--spacing-xl);
    }
}
```

## 验证步骤
1. 检查右侧是否显示为2列多行网格布局
2. 检查每个组是否占用一个网格单元
3. 检查左侧菜单是否为2列布局且顺序正确
4. 测试响应式布局在不同屏幕尺寸下的表现
5. 验证所有链接和交互功能正常工作