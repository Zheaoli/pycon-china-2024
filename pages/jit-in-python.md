---
transition: view-transition
---

# 当前 Python 中 JIT 的实现

<div class="grid grid-cols-3 gap-10 pt-4 -mb-6">

<v-clicks>

<div>

当前 Python 中有数百个字节码，怎么样将其编译成机器码呢？

</div>

<div>

手写？

</div>

<div>

死了算了

</div>

</v-clicks>

</div>

---
transition: view-transition
---

# 当前 Python 中 JIT 的实现

<div class="grid grid-cols-3 gap-10 pt-4 -mb-6">

<v-clicks>

<div>

在继续之前，我们先来看一段 C 代码

```c

int add(int a, int b) {
    return a + b;
}

```

</div>

<div>

这段代码在编译后，会得到这样的汇编代码

</div>

<div>

```text {monaco}
0000000000000000 <add>:
       0: 55                            pushq   %rbp
       1: 48 89 e5                      movq    %rsp, %rbp
       4: 89 7d fc                      movl    %edi, -0x4(%rbp)
       7: 89 75 f8                      movl    %esi, -0x8(%rbp)
       a: 8b 55 fc                      movl    -0x4(%rbp), %edx
       d: 8b 45 f8                      movl    -0x8(%rbp), %eax
      10: 01 d0                         addl    %edx, %eax
      12: 5d                            popq    %rbp
      13: c3                            retq

```

</div>

</v-clicks>

</div>

---
transition: view-transition
---

# 当前 Python 中 JIT 的实现

<div class="grid grid-cols-4 gap-10 pt-4 -mb-6">

<v-clicks>

<div>

OK， 我们现在再来看一段另外的代码

```c {monaco}
int load_left();
int load_right();
int add() {
    return load_left() + load_right();
}
```

编译成汇编，会编程这样

</div>

<div>

```text {monaco}
0000000000000000 <add>:
       0: 55                            pushq   %rbp
       1: 48 89 e5                      movq    %rsp, %rbp
       4: 53                            pushq   %rbx
       5: 48 83 ec 08                   subq    $0x8, %rsp
       9: b8 00 00 00 00                movl    $0x0, %eax
       e: e8 00 00 00 00                callq   0x13 <add+0x13>
                000000000000000f:  R_X86_64_PLT32       load_left-0x4
      13: 89 c3                         movl    %eax, %ebx
      15: b8 00 00 00 00                movl    $0x0, %eax
      1a: e8 00 00 00 00                callq   0x1f <add+0x1f>
                000000000000001b:  R_X86_64_PLT32       load_right-0x4
      1f: 01 d8                         addl    %ebx, %eax
      21: 48 8b 5d f8                   movq    -0x8(%rbp), %rbx
      25: c9                            leave
      26: c3                            retq

```

</div>

<div>

我们能在其中看到一些熟悉而又陌生的条目

```text {monaco}
 e: e8 00 00 00 00                callq   0x13 <add+0x13>
          000000000000000f:  R_X86_64_PLT32       load_left-0x4
1a: e8 00 00 00 00                callq   0x1f <add+0x1f>
          000000000000001b:  R_X86_64_PLT32       load_right-0x4
```

那么可能有些同学已经反应过来了，如果我们有办法将这段汇编代码中的 e8 00 00 00 00 替换成 e8 xx xx xx xx，那么我们就可以在这里 patch 上我们的代码了。这里是不是可以作为我们 JIT 的入口了呢？

Exacly!

</div>

<div>

这就是 Copy And Patch 的 JIT 实现方式

</div>

</v-clicks>

</div>

---
transition: view-transition
---

# 当前 Python 中 JIT 的实现

<div class="grid grid-cols-3 gap-10 pt-4 -mb-6">

<v-clicks>

<div>

回到 CPython， 我们每个字节码都有现成的代码，

```c
case _BINARY_OP_ADD_INT: {
    PyObject *right;
    PyObject *left;
    PyObject *res;
    right = stack_pointer[-1];
    left = stack_pointer[-2];
    STAT_INC(BINARY_OP, hit);
    res = _PyLong_Add((PyLongObject *)left, (PyLongObject *)right);
    _Py_DECREF_SPECIALIZED(right, (destructor)PyObject_Free);
    _Py_DECREF_SPECIALIZED(left, (destructor)PyObject_Free);
    if (res == NULL) goto pop_2_error_tier_two;
    stack_pointer[-2] = res;
    stack_pointer += -1;
    break;
}

```

</div>

<div>

我们可以利用 LLVM 来编译这些代码

</div>

<div>

最终将代码动态编译为机器码

</div>

</v-clicks>

</div>

---
transition: view-transition
---

# 当前 Python 中 JIT 的实现

- 更高效率的字节码生成
- 更好的代码特化
- 更好的可观测性
