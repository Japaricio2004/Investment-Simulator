
        let scene, camera, renderer, chart, particles;
        let animationId;
        let currentStrategy = 'balanced';
        let simulationData = [];

        const strategies = {
            balanced: { 
                baseReturn: 0.07, 
                volatility: 0.12, 
                name: 'Balanceada',
                color: 0x00d4ff
            },
            growth: { 
                baseReturn: 0.09, 
                volatility: 0.18, 
                name: 'Crecimiento',
                color: 0x06ffa5
            },
            income: { 
                baseReturn: 0.05, 
                volatility: 0.08, 
                name: 'Renta Fija',
                color: 0x7c3aed
            },
            crypto: { 
                baseReturn: 0.15, 
                volatility: 0.35, 
                name: 'Criptomonedas',
                color: 0xff6b6b
            },
            tech: { 
                baseReturn: 0.12, 
                volatility: 0.25, 
                name: 'Tecnología',
                color: 0xffd93d
            }
        };

        const riskMultipliers = {
            conservative: { return: 0.6, volatility: 0.5 },
            moderate: { return: 1.0, volatility: 1.0 },
            aggressive: { return: 1.4, volatility: 1.8 },
            speculative: { return: 2.0, volatility: 2.5 }
        };
        
        function initThreeJS() {
            const container = document.getElementById('canvas-container');
            
            scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0x0a0a0a, 1, 100);
            
            camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.set(0, 5, 15);
            
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setClearColor(0x000000, 0.1);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(renderer.domElement);

            const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0x00d4ff, 1);
            directionalLight.position.set(10, 10, 5);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0x7c3aed, 0.8, 50);
            pointLight.position.set(-10, 5, -10);
            scene.add(pointLight);

            createParticleSystem();
            
            window.addEventListener('resize', onWindowResize);
            
            animate();
        }

        function createParticleSystem() {
            const particleCount = 1000;
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 100;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
                
                const color = new THREE.Color();
                color.setHSL(Math.random() * 0.2 + 0.5, 0.7, 0.5);
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            }
            
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const material = new THREE.PointsMaterial({
                size: 0.5,
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            
            particles = new THREE.Points(geometry, material);
            scene.add(particles);
        }

        function create3DChart(data) {
            if (chart) {
                scene.remove(chart);
            }
            
            chart = new THREE.Group();
            const strategy = strategies[currentStrategy];
            
            const points = [];
            const maxValue = Math.max(...data.map(d => d.value));
            const scale = 10 / maxValue;
            
            data.forEach((point, index) => {
                const x = (index / (data.length - 1)) * 20 - 10;
                const y = point.value * scale;
                const z = 0;
                points.push(new THREE.Vector3(x, y, z));
                
                const sphereGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const sphereMaterial = new THREE.MeshPhongMaterial({ 
                    color: strategy.color,
                    emissive: strategy.color,
                    emissiveIntensity: 0.2
                });
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.position.set(x, y, z);
                sphere.castShadow = true;
                chart.add(sphere);
                
                const glowGeometry = new THREE.SphereGeometry(0.15, 8, 8);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: strategy.color,
                    transparent: true,
                    opacity: 0.3,
                    blending: THREE.AdditiveBlending
                });
                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                glow.position.set(x, y, z);
                chart.add(glow);
                
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(x, 0, z),
                    new THREE.Vector3(x, y, z)
                ]);
                const lineMaterial = new THREE.LineBasicMaterial({ 
                    color: strategy.color,
                    transparent: true,
                    opacity: 0.5
                });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                chart.add(line);
            });
            
            const curve = new THREE.CatmullRomCurve3(points);
            const curvePoints = curve.getPoints(100);
            const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
            const curveMaterial = new THREE.LineBasicMaterial({ 
                color: strategy.color,
                linewidth: 3
            });
            const curveLine = new THREE.Line(curveGeometry, curveMaterial);
            chart.add(curveLine);
            
            const planeGeometry = new THREE.PlaneGeometry(22, 15);
            const planeMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x111111,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.rotation.x = -Math.PI / 2;
            plane.position.y = -1;
            plane.receiveShadow = true;
            chart.add(plane);
            
            scene.add(chart);
        }

        function generateInvestmentData() {
            const initialCapital = parseFloat(document.getElementById('initialCapital').value);
            const period = parseInt(document.getElementById('period').value);
            const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
            const riskTolerance = document.getElementById('riskTolerance').value;
            
            const strategy = strategies[currentStrategy];
            const riskMultiplier = riskMultipliers[riskTolerance];
            
            const adjustedReturn = strategy.baseReturn * riskMultiplier.return;
            const adjustedVolatility = strategy.volatility * riskMultiplier.volatility;
            
            const data = [];
            let currentValue = initialCapital;
            
            for (let month = 0; month <= period * 12; month++) {
                if (month > 0) {
                currentValue += monthlyContribution;
                }
                
                const monthlyReturn = adjustedReturn / 12;
                const volatilityAdjustment = (Math.random() - 0.5) * adjustedVolatility * 2;
                const actualReturn = monthlyReturn + volatilityAdjustment;
                
                currentValue *= (1 + actualReturn);
                
                data.push({
                    month: month,
                    value: currentValue,
                    contribution: monthlyContribution * month,
                    return: actualReturn
                });
            }
            
            return data;
        }

        function runSimulation() {
            const container = document.getElementById('canvas-container');
            container.innerHTML = '<div class="loading">Ejecutando simulación...</div>';
            
            setTimeout(() => {
                initThreeJS();
                
                simulationData = generateInvestmentData();
                create3DChart(simulationData);
                updateStats();
                
                animateCamera();
            }, 500);
        }

        function updateStats() {
            const initialCapital = parseFloat(document.getElementById('initialCapital').value);
            const period = parseInt(document.getElementById('period').value);
            const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
            
            const finalValue = simulationData[simulationData.length - 1].value;
            const totalContributions = initialCapital + (monthlyContribution * period * 12);
            const totalGain = finalValue - totalContributions;
            const roi = ((finalValue - totalContributions) / totalContributions) * 100;
            const annualReturn = (Math.pow(finalValue / initialCapital, 1 / period) - 1) * 100;
            
            const returns = simulationData.slice(1).map(d => d.return);
            const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
            const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
            const volatility = Math.sqrt(variance * 12) * 100; // Annualized
            
            document.getElementById('finalCapital').textContent = `$${finalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            document.getElementById('totalGain').textContent = `$${totalGain.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            document.getElementById('totalGain').className = `stat-value ${totalGain >= 0 ? 'profit' : 'loss'}`;
            document.getElementById('roi').textContent = `${roi.toFixed(1)}%`;
            document.getElementById('roi').className = `stat-value ${roi >= 0 ? 'profit' : 'loss'}`;
            document.getElementById('annualReturn').textContent = `${annualReturn.toFixed(1)}%`;
            document.getElementById('volatility').textContent = `${volatility.toFixed(1)}%`;
        }

        function animateCamera() {
            const startPosition = { x: 0, y: 5, z: 15 };
            const endPosition = { x: 5, y: 8, z: 12 };
            let progress = 0;
            
            function animate() {
                progress += 0.02;
                if (progress <= 1) {
                    camera.position.x = startPosition.x + (endPosition.x - startPosition.x) * progress;
                    camera.position.y = startPosition.y + (endPosition.y - startPosition.y) * progress;
                    camera.position.z = startPosition.z + (endPosition.z - startPosition.z) * progress;
                    camera.lookAt(0, 2, 0);
                    requestAnimationFrame(animate);
                }
            }
            animate();
        }

        function animate() {
            animationId = requestAnimationFrame(animate);
            
            if (particles) {
                particles.rotation.y += 0.001;
                particles.rotation.x += 0.0005;
            }
            
            if (chart) {
                chart.rotation.y += 0.002;
            }
            
            const time = Date.now() * 0.0005;
            camera.position.x = Math.cos(time) * 15;
            camera.position.z = Math.sin(time) * 15;
            camera.lookAt(0, 2, 0);
            
            renderer.render(scene, camera);
        }

        function onWindowResize() {
            const container = document.getElementById('canvas-container');
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }

        function resetSimulation() {
            if (chart) {
                scene.remove(chart);
            }
            simulationData = [];
            
            document.getElementById('finalCapital').textContent = '$0';
            document.getElementById('totalGain').textContent = '$0';
            document.getElementById('roi').textContent = '0%';
            document.getElementById('annualReturn').textContent = '0%';
            document.getElementById('volatility').textContent = '0%';
            
            camera.position.set(0, 5, 15);
        }

        document.querySelectorAll('.strategy-card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.strategy-card').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                currentStrategy = this.dataset.strategy;
            });
        });

        document.addEventListener('DOMContentLoaded', function() {
            initThreeJS();
        });
